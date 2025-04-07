import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger"
import type { IngestionService } from "./ingestion.service"
import type { UpdateIngestionDto } from "./dto/update-ingestion.dto"
import { WebhookGuard } from "./guards/webhook.guard"

@ApiTags("ingestion-webhook")
@Controller("webhook/ingestion")
export class IngestionWebhookController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post(":id/status")
  @UseGuards(WebhookGuard)
  @HttpCode(HttpStatus.OK)
  @ApiSecurity("webhook-key")
  @ApiOperation({ summary: "Update ingestion status (webhook from Python backend)" })
  @ApiResponse({ status: 200, description: "Ingestion status updated successfully" })
  @ApiResponse({ status: 404, description: "Ingestion not found" })
  updateStatus(@Body('id') id: string, @Body() updateIngestionDto: UpdateIngestionDto) {
    return this.ingestionService.update(id, updateIngestionDto)
  }
}

