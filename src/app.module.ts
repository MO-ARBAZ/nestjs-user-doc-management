import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { DocumentsModule } from "./documents/documents.module"
import { IngestionModule } from "./ingestion/ingestion.module"
import { User } from "./users/entities/user.entity"
import { Document } from "./documents/entities/document.entity"
import { Ingestion } from "./ingestion/entities/ingestion.entity"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 5432),
        username: configService.get("DB_USERNAME", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_DATABASE", "document_management"),
        entities: [User, Document, Ingestion],
        synchronize: configService.get<boolean>("DB_SYNC", false),
        logging: configService.get<boolean>("DB_LOGGING", false),
      }),
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    IngestionModule,
  ],
})
export class AppModule {}

