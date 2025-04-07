import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { IngestionService } from "./ingestion.service"
import { IngestionController } from "./ingestion.controller"
import { Ingestion } from "./entities/ingestion.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Ingestion])],
  controllers: [IngestionController],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}

