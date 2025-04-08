import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    cancel: jest.fn(),
  };

  const mockReq = {
    user: {
      id: 'user123',
      role: 'admin',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        { provide: IngestionService, useValue: mockService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create with DTO and user ID', async () => {
    const dto = { documentId: 'doc1' };
    await controller.create(dto, mockReq);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'user123');
  });

  it('should return all ingestions', async () => {
    await controller.findAll(mockReq);
    expect(mockService.findAll).toHaveBeenCalledWith('user123', 'admin');
  });

  it('should return one ingestion by id', async () => {
    await controller.findOne('ingest1', mockReq);
    expect(mockService.findOne).toHaveBeenCalledWith('ingest1', 'user123', 'admin');
  });

  it('should cancel an ingestion', async () => {
    await controller.cancel('ingest1', mockReq);
    expect(mockService.cancel).toHaveBeenCalledWith('ingest1', 'user123', 'admin');
  });
});
