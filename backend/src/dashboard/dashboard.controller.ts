import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('total-productos')
  getTotalProductos() {
    return this.dashboardService.getTotalProductos();
  }

  @Get('ordenes-activas')
  getOrdenesActivas() {
    return this.dashboardService.getOrdenesActivas();
  }

  @Get('usuarios-registrados')
  getUsuariosRegistrados() {
    return this.dashboardService.getUsuariosRegistrados();
  }

  @Get('ventas-del-mes')
  getVentasDelMes() {
    return this.dashboardService.getVentasDelMes();
  }

  @Get('ventas-recientes')
  getVentasRecientes() {
    return this.dashboardService.getVentasRecientes();
  }

  @Get('productos-populares')
  getProductosPopulares() {
    return this.dashboardService.getProductosPopulares();
  }
}
