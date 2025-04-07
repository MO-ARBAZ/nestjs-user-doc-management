import { IsNotEmpty, IsString, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateDocumentDto {
  @ApiProperty({ example: "Project Proposal" })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ example: "Detailed project proposal for Q3 2023", required: false })
  @IsString()
  @IsOptional()
  description?: string
}

