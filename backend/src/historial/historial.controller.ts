import { Controller, Get, Req, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { HistorialService } from './historial.service';

import type { Response, Request } from 'express';
import { UnifiedAuthGuard } from 'src/auth/guards/supabase-auth.guard';

@Controller('historial')
export class HistorialController {
  constructor(private historialService: HistorialService) { }

  @UseGuards(UnifiedAuthGuard)
  @Get('mi-historial')
  async getMiHistorial(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req['user'];
      const userId = user.id;

      const data = await this.historialService.getUserHistorial(userId);

      return res.status(HttpStatus.OK).json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error obteniendo historial de compras',
        error: message,
      });
    }
  }
}
