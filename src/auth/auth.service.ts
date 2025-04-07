import { Injectable, UnauthorizedException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import type { UsersService } from "../users/users.service"
import type { RegisterDto } from "./dto/register.dto"
import type { LoginDto } from "./dto/login.dto"
import { Role } from "../common/enums/role.enum"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      role: Role.VIEWER, // Default role for new registrations
    })

    const { password, ...result } = user
    return result
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password)

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken: this.jwtService.sign(payload),
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email)
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid credentials")
      }

      if (!user.isActive) {
        throw new UnauthorizedException("User account is inactive")
      }

      return user
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials")
    }
  }
}

