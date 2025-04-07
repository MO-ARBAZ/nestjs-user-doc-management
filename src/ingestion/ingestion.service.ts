import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { type ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices"
import type { ConfigService } from "@nestjs/config"
import { Ingestion, IngestionStatus } from "./entities/ingestion.entity"
import type { CreateIngestionDto } from "./dto/create-ingestion.dto"
import type { UpdateIngestionDto } from "./dto/update-ingestion.dto"

@Injectable()
export class IngestionService {
  private pythonServiceClient: ClientProxy;

  constructor(
    @InjectRepository(Ingestion)
    private ingestionsRepository: Repository<Ingestion>,
    private configService: ConfigService,
  ) {
    // Setup microservice client to communicate with Python backend
    this.pythonServiceClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get('PYTHON_SERVICE_HOST', 'localhost'),
        port: this.configService.get('PYTHON_SERVICE_PORT', 3001),
      },
    });
  }

  async create(createIngestionDto: CreateIngestionDto, userId: string): Promise<Ingestion> {
    const ingestion = this.ingestionsRepository.create({
      ...createIngestionDto,
      initiatedById: userId,
      status: IngestionStatus.PENDING,
    })

    const savedIngestion = await this.ingestionsRepository.save(ingestion)

    // Trigger ingestion process in Python backend
    this.pythonServiceClient.emit("ingestion.start", {
      ingestionId: savedIngestion.id,
      documentId: savedIngestion.documentId,
    })

    return savedIngestion
  }

  async findAll(userId: string, role: string): Promise<Ingestion[]> {
    // Admins can see all ingestions, others can only see their own
    if (role === "admin") {
      return this.ingestionsRepository.find({
        relations: ["document", "initiatedBy"],
      })
    } else {
      return this.ingestionsRepository.find({
        where: { initiatedById: userId },
        relations: ["document", "initiatedBy"],
      })
    }
  }

  async findOne(id: string, userId: string, role: string): Promise<Ingestion> {
    const ingestion = await this.ingestionsRepository.findOne({
      where: { id },
      relations: ["document", "initiatedBy"],
    })

    if (!ingestion) {
      throw new NotFoundException(`Ingestion with ID ${id} not found`)
    }

    // Check if user has access to this ingestion
    if (role !== "admin" && ingestion.initiatedById !== userId) {
      throw new NotFoundException(`Ingestion with ID ${id} not found`)
    }

    return ingestion
  }

  async update(id: string, updateIngestionDto: UpdateIngestionDto): Promise<Ingestion> {
    const ingestion = await this.ingestionsRepository.findOne({
      where: { id },
    })

    if (!ingestion) {
      throw new NotFoundException(`Ingestion with ID ${id} not found`)
    }

    // Update status and set completedAt if status is COMPLETED or FAILED
    if (
      updateIngestionDto.status === IngestionStatus.COMPLETED ||
      updateIngestionDto.status === IngestionStatus.FAILED
    ) {
      updateIngestionDto["completedAt"] = new Date()
    }

    Object.assign(ingestion, updateIngestionDto)
    return this.ingestionsRepository.save(ingestion)
  }

  async cancel(id: string, userId: string, role: string): Promise<Ingestion> {
    const ingestion = await this.findOne(id, userId, role)

    // Only pending or processing ingestions can be cancelled
    if (ingestion.status !== IngestionStatus.PENDING && ingestion.status !== IngestionStatus.PROCESSING) {
      throw new BadRequestException(`Cannot cancel ingestion with status ${ingestion.status}`)
    }

    // Check if user has permission to cancel
    if (role !== "admin" && ingestion.initiatedById !== userId) {
      throw new BadRequestException("You do not have permission to cancel this ingestion")
    }

    // Notify Python backend to cancel the ingestion
    this.pythonServiceClient.emit("ingestion.cancel", {
      ingestionId: ingestion.id,
    })

    // Update status to FAILED with a cancellation message
    ingestion.status = IngestionStatus.FAILED
    ingestion.errorMessage = "Cancelled by user"
    ingestion.completedAt = new Date()

    return this.ingestionsRepository.save(ingestion)
  }
}

