import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Document } from "../../documents/entities/document.entity"

export enum IngestionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity()
export class Ingestion {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: IngestionStatus,
    default: IngestionStatus.PENDING,
  })
  status: IngestionStatus

  @Column({ type: "text", nullable: true })
  errorMessage: string

  @ManyToOne(() => Document)
  @JoinColumn({ name: "documentId" })
  document: Document

  @Column()
  documentId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "initiatedById" })
  initiatedBy: User

  @Column()
  initiatedById: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  completedAt: Date

  constructor(partial: Partial<Ingestion>) {
    Object.assign(this, partial)
  }
}

