import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import * as fs from "fs"
import * as path from "path"
import { Document } from "./entities/document.entity"
import type { CreateDocumentDto } from "./dto/create-document.dto"
import type { UpdateDocumentDto } from "./dto/update-document.dto"
import type { Express } from "express"

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async create(createDocumentDto: CreateDocumentDto, file: Express.Multer.File, userId: string): Promise<Document> {
    if (!file) {
      throw new BadRequestException("File is required")
    }

    const document = this.documentsRepository.create({
      ...createDocumentDto,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
      size: file.size,
      ownerId: userId,
    })

    return this.documentsRepository.save(document)
  }

  async findAll(userId: string, role: string): Promise<Document[]> {
    // Admins can see all documents, others can only see their own
    if (role === "admin") {
      return this.documentsRepository.find({
        relations: ["owner"],
      })
    } else {
      return this.documentsRepository.find({
        where: { ownerId: userId },
        relations: ["owner"],
      })
    }
  }

  async findOne(id: string, userId: string, role: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ["owner"],
    })

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`)
    }

    // Check if user has access to this document
    if (role !== "admin" && document.ownerId !== userId) {
      throw new NotFoundException(`Document with ID ${id} not found`)
    }

    return document
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string, role: string): Promise<Document> {
    const document = await this.findOne(id, userId, role)

    // Check if user has permission to update
    if (role !== "admin" && document.ownerId !== userId) {
      throw new BadRequestException("You do not have permission to update this document")
    }

    Object.assign(document, updateDocumentDto)
    return this.documentsRepository.save(document)
  }

  async remove(id: string, userId: string, role: string): Promise<void> {
    const document = await this.findOne(id, userId, role)

    // Check if user has permission to delete
    if (role !== "admin" && document.ownerId !== userId) {
      throw new BadRequestException("You do not have permission to delete this document")
    }

    // Delete the file from the filesystem
    try {
      fs.unlinkSync(document.path)
    } catch (error) {
      console.error(`Failed to delete file: ${document.path}`, error)
    }

    await this.documentsRepository.remove(document)
  }

  getFilePath(id: string, userId: string, role: string): Promise<string> {
    return this.findOne(id, userId, role).then((document) => document.path)
  }
}

