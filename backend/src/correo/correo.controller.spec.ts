import { Test, TestingModule } from '@nestjs/testing';
import { CorreoController } from './correo.controller';

describe('CorreoController', () => {
  let controller: CorreoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorreoController],
    }).compile();

    controller = module.get<CorreoController>(CorreoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
