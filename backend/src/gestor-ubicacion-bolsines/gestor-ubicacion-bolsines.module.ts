import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GestorUbicacionBolsinesController } from './gestor-ubicacion-bolsines.controller';
import { GestorUbicacionBolsinesService } from './gestor-ubicacion-bolsines.service';
import { Sesion } from '../sesion/sesion.entity';
import { Bolsin } from '../bolsin/bolsin.entity';
import { Empleado } from '../empleado/empleado.entity';
import { UbicacionBolsin } from '../ubicacion-bolsin/ubicacion-bolsin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sesion, Bolsin, Empleado, UbicacionBolsin]),
  ],
  controllers: [GestorUbicacionBolsinesController],
  providers: [GestorUbicacionBolsinesService],
})
export class GestorUbicacionBolsinesModule {}