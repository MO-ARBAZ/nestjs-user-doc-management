import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  password: 'hashedPassword',
  role: 'USER',
};

const mockUserArray = [mockUser];

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const result = await service.create({
        email: 'test@example.com',
        password: '123456',
        role: 'USER',
      });

      expect(hashSpy).toHaveBeenCalledWith('123456', 10);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({
          email: 'test@example.com',
          password: '123456',
          role: 'USER',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserRepo.find.mockResolvedValue(mockUserArray);
      const result = await service.findAll();
      expect(result).toEqual(mockUserArray);
      expect(mockUserRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return the user by ID', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if email not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.findByEmail('notfound@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updatedUser = { ...mockUser, email: 'new@example.com' };
      mockUserRepo.findOne
        .mockResolvedValueOnce(mockUser) // findOne by ID
        .mockResolvedValueOnce(null);   // check if new email exists

      mockUserRepo.save.mockResolvedValue(updatedUser);

      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashedPassword');

      const result = await service.update('1', {
        email: 'new@example.com',
        password: 'newpass',
        role: 'ADMIN',
      });

      expect(hashSpy).toHaveBeenCalledWith('newpass', 10
