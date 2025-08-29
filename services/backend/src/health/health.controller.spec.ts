import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('HealthCoachAI Backend');
      expect(result.version).toBe('0.1.0');
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('getReadiness', () => {
    it('should return readiness status', () => {
      const result = controller.getReadiness();
      expect(result.status).toBe('ready');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});