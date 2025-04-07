import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Exclude } from "class-transformer"
import { Role } from "../../common/enums/role.enum"
import { Document } from "../../documents/entities/document.entity"

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  @Exclude()
  password: string

  @Column({
    type: "enum",
    enum: Role,
    default: Role.VIEWER,
  })
  role: Role

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(
    () => Document,
    (document) => document.owner,
  )
  documents: Document[]

  constructor(partial: Partial<User>) {
    Object.assign(this, partial)
  }
}

