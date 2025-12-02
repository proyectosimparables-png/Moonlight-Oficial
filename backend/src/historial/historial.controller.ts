import { Controller, Get, Req, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { SupabaseAuthGuard } from 'src/auth/guards/supabase-auth.guard';
import type { Response, Request } from 'express';

@Controller('historial')
export class HistorialController {
  constructor(private historialService: HistorialService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('mi-historial')
  async getMiHistorial(@Req() req: Request, @Res() res: Response) {
    try {
      const supabaseUser = req['supabaseUser'];
      const userId = supabaseUser.id;

      const data = await this.historialService.getUserHistorial(userId);

      return res.status(HttpStatus.OK).json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error obteniendo historial',
        error: message,
      });
    }
  }
}
