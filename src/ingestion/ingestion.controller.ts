import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch } from "@nestjs/common"
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import type { IngestionService } from "./ingestion.service"
import type { CreateIngestionDto } from "./dto/create-ingestion.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../common/guards/roles.guard"
import { Roles } from "../common/decorators/roles.decorator"
import { Role } from "../common/enums/role.enum"

@ApiTags("ingestion")
@Controller("ingestion")
@UseGuards(JwtAuthGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Trigger document ingestion (Admin and Editor only)" })
  @ApiResponse({ status: 201, description: "Ingestion started successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() createIngestionDto: CreateIngestionDto, @Req() req) {
    return this.ingestionService.create(createIngestionDto, req.user.id)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all ingestions' })
  @ApiResponse({ status: 200, description: 'Return all ingestions' })
  findAll(@Req() req) {
    return this.ingestionService.findAll(req.user.id, req.user.role);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get an ingestion by ID" })
  @ApiResponse({ status: 200, description: "Return the ingestion" })
  @ApiResponse({ status: 404, description: "Ingestion not found" })
  findOne(@Param('id') id: string, @Req() req) {
    return this.ingestionService.findOne(id, req.user.id, req.user.role)
  }

  @Patch(":id/cancel")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cancel an ingestion" })
  @ApiResponse({ status: 200, description: "Ingestion cancelled successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Ingestion not found" })
  cancel(@Param('id') id: string, @Req() req) {
    return this.ingestionService.cancel(id, req.user.id, req.user.role)
  }
}

