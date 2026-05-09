import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionTiendaController } from './configuracion-tienda.controller';
import { ConfiguracionTiendaService } from './configuracion-tienda.service';

describe('ConfiguracionTiendaController', () => {
  let controller: ConfiguracionTiendaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfiguracionTiendaController],
      providers: [ConfiguracionTiendaService],
    }).compile();

    controller = module.get<ConfiguracionTiendaController>(ConfiguracionTiendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
