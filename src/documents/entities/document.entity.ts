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

@Entity()
export class Document {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column()
  filename: string

  @Column()
  mimetype: string

  @Column()
  path: string

  @Column({ type: "int" })
  size: number

  @ManyToOne(
    () => User,
    (user) => user.documents,
  )
  @JoinColumn({ name: "ownerId" })
  owner: User

  @Column()
  ownerId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  constructor(partial: Partial<Document>) {
    Object.assign(this, partial)
  }
}

