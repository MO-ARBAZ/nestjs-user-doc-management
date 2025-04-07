import { IsEnum, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { IngestionStatus } from "../entities/ingestion.entity"

export class UpdateIngestionDto {
  @ApiProperty({ enum: IngestionStatus })
  @IsEnum(IngestionStatus)
  @IsOptional()
  status?: IngestionStatus

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  errorMessage?: string
}

