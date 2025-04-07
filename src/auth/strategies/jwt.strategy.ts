import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import type { ConfigService } from "@nestjs/config"
import type { UsersService } from "../../users/users.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    })
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findOne(payload.sub)

      if (!user.isActive) {
        throw new UnauthorizedException("User account is inactive")
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    } catch (error) {
      throw new UnauthorizedException("Invalid token")
    }
  }
}

