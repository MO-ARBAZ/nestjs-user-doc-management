import { Test, TestingModule } from '@nestjs/testing';
import { IngestionWebhookController } from './ingestion-webhook.controller';
import { IngestionService } from './ingestion.service';
import { WebhookGuard } from './guards/webhook.guard';

describe('IngestionWebhookController', () => {
  let controller: IngestionWebhookController;
  let service: IngestionService;

  const mockService = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionWebhookController],
      providers: [{ provide: IngestionService, useValue: mockService }],
    })
      .overrideGuard(WebhookGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<IngestionWebhookController>(IngestionWebhookController);
    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call update on service with correct parameters', async () => {
    const dto = { status: 'COMPLETED' };
    await controller.updateStatus('ingest1', dto);
    expect(mockService.update).toHaveBeenCalledWith('ingest1', dto);
  });
});
