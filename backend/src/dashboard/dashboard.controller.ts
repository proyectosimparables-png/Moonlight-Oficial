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

 @Get('resumen')
async getResumenGeneral() {
  const [
    totalProductos, 
    ordenesActivas, 
    usuariosRegistrados, 
    ventasDelMes,
    ventasRecientes,      // <--- Agregamos esto
    productosPopulares    // <--- Agregamos esto
  ] = await Promise.all([
    this.dashboardService.getTotalProductos(),
    this.dashboardService.getOrdenesActivas(),
    this.dashboardService.getUsuariosRegistrados(),
    this.dashboardService.getVentasDelMes(),
    this.dashboardService.getVentasRecientes(),
    this.dashboardService.getProductosPopulares(),
  ]);

  return {
    totalProductos,
    ordenesActivas,
    usuariosRegistrados,
    ventasDelMes,
    ventasRecientes,    // <--- Ahora viajan en el JSON
    productosPopulares,  // <--- Ahora viajan en el JSON
  };
}
}