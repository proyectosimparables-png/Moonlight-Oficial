import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionTiendaService } from './configuracion-tienda.service';

describe('ConfiguracionTiendaService', () => {
  let service: ConfiguracionTiendaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfiguracionTiendaService],
    }).compile();

    service = module.get<ConfiguracionTiendaService>(ConfiguracionTiendaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
