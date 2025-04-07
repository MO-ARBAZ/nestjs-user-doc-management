import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"

@Injectable()
export class WebhookGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const webhookKey = request.headers["x-webhook-key"]

    if (!webhookKey) {
      throw new UnauthorizedException("Webhook key is missing")
    }

    const configuredKey = this.configService.get<string>("WEBHOOK_KEY")

    if (!configuredKey || webhookKey !== configuredKey) {
      throw new UnauthorizedException("Invalid webhook key")
    }

    return true
  }
}

