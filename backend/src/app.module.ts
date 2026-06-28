import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from './empleado/empleado.entity';
import { Rol } from './rol/rol.entity';
import { Sesion } from './sesion/sesion.entity';
import { ComisionMedica } from './comision-medica/comision-medica.entity';
import { Bolsin } from './bolsin/bolsin.entity';
import { Estado } from './estado/estado.entity';
import { CambioEstadoBolsin } from './cambio-estado-bolsin/cambio-estado-bolsin.entity';
import { UbicacionBolsin } from './ubicacion-bolsin/ubicacion-bolsin.entity';
import { GestorUbicacionBolsinesModule } from './gestor-ubicacion-bolsines/gestor-ubicacion-bolsines.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          Empleado,
          Rol,
          Sesion,
          ComisionMedica,
          Bolsin,
          Estado,
          CambioEstadoBolsin,
          UbicacionBolsin,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    GestorUbicacionBolsinesModule,
  ],
})
export class AppModule {}