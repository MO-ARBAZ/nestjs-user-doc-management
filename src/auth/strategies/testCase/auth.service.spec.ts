import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register user with default role', async () => {
      const dto = {
        email: 'test@example.com',
        password: '123456',
        firstName: 'Test',
        lastName: 'User',
      };

      const user = {
        id: '1',
        ...dto,
        role: Role.VIEWER,
      };

      mockUsersService.create.mockResolvedValue({ ...user });

      const result = await service.register(dto as any);
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        password: undefined,
        firstName: 'Test',
        lastName: 'User',
        role: Role.VIEWER,
      });
    });
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      const dto = { email: 'test@example.com', password: '123456' };
      const user = {
        id: '1',
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        firstName: 'Test',
        lastName: 'User',
        role: Role.VIEWER,
        isActive: true,
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mocked_token');

      const result = await service.login(dto as any);
      expect(result.accessToken).toBe('mocked_token');
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw Unauthorized if credentials are invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ password: 'wrong', isActive: true });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw Unauthorized if user is inactive', async () => {
      const user = {
        password: await bcrypt.hash('123456', 10),
        isActive: false,
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(service.login({ email: 'test@example.com', password: '123456' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});