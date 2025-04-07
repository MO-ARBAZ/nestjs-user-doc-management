import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Role } from "../../common/enums/role.enum"

export class CreateUserDto {
  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ example: "John" })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ example: "Doe" })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string

  @ApiProperty({ enum: Role, example: Role.VIEWER, default: Role.VIEWER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role
}

