import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { GestorUbicacionBolsinesService } from './gestor-ubicacion-bolsines.service';

@Controller('gestor-ubicacion-bolsines')
export class GestorUbicacionBolsinesController {
  constructor(
    private readonly gestorService: GestorUbicacionBolsinesService,
  ) {}

  // Paso 3: Pantalla invoca consultarUbicacionBolsin()
  @Get('consultar/:sesionId')
  async consultarUbicacionBolsin(@Param('sesionId') sesionId: number) {
    return this.gestorService.consultarUbicacionBolsin(sesionId);
  }

  // Paso 30: Pantalla invoca tomarSelecBolsin()
  @Post('seleccionar-bolsin')
  async tomarSelecBolsin(@Body() body: { sesionId: number; bolsinId: number }) {
    return this.gestorService.tomarSelecBolsin(body.sesionId, body.bolsinId);
  }

  // Paso 35: Pantalla invoca tomarConfirmacionEnvioCorreo()
  @Post('confirmar-envio-correo')
  async tomarConfirmacionEnvioCorreo(
    @Body() body: { sesionId: number; bolsinId: number; confirma: boolean },
  ) {
    return this.gestorService.tomarConfirmacionEnvioCorreo(
      body.sesionId,
      body.bolsinId,
      body.confirma,
    );
  }
}