import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  StreamableFile,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from "@nestjs/swagger"
import { diskStorage } from "multer"
import { extname } from "path"
import { createReadStream } from "fs"
import type { DocumentsService } from "./documents.service"
import type { CreateDocumentDto } from "./dto/create-document.dto"
import type { UpdateDocumentDto } from "./dto/update-document.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { Response } from "express"

@ApiTags("documents")
@Controller("documents")
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("")
          return cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload a new document" })
  @ApiResponse({ status: 201, description: "Document uploaded successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() createDocumentDto: CreateDocumentDto, @UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.documentsService.create(createDocumentDto, file, req.user.id)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, description: 'Return all documents' })
  findAll(@Req() req) {
    return this.documentsService.findAll(req.user.id, req.user.role);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a document by ID" })
  @ApiResponse({ status: 200, description: "Return the document" })
  @ApiResponse({ status: 404, description: "Document not found" })
  findOne(@Param('id') id: string, @Req() req) {
    return this.documentsService.findOne(id, req.user.id, req.user.role)
  }

  @Get(":id/download")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Download a document" })
  @ApiResponse({ status: 200, description: "Return the document file" })
  @ApiResponse({ status: 404, description: "Document not found" })
  async download(@Param('id') id: string, @Req() req, @Res({ passthrough: true }) res: Response) {
    const document = await this.documentsService.findOne(id, req.user.id, req.user.role)
    const file = createReadStream(document.path)

    res.set({
      "Content-Type": document.mimetype,
      "Content-Disposition": `attachment; filename="${document.filename}"`,
    })

    return new StreamableFile(file)
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a document" })
  @ApiResponse({ status: 200, description: "Document updated successfully" })
  @ApiResponse({ status: 404, description: "Document not found" })
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto, @Req() req) {
    return this.documentsService.update(id, updateDocumentDto, req.user.id, req.user.role)
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a document" })
  @ApiResponse({ status: 200, description: "Document deleted successfully" })
  @ApiResponse({ status: 404, description: "Document not found" })
  remove(@Param('id') id: string, @Req() req) {
    return this.documentsService.remove(id, req.user.id, req.user.role)
  }
}

