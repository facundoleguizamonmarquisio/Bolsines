import { DataSource } from 'typeorm';
import { Rol } from './rol/rol.entity';
import { Empleado } from './empleado/empleado.entity';
import { ComisionMedica } from './comision-medica/comision-medica.entity';
import { Sesion } from './sesion/sesion.entity';
import { Estado } from './estado/estado.entity';
import { Bolsin } from './bolsin/bolsin.entity';
import { CambioEstadoBolsin } from './cambio-estado-bolsin/cambio-estado-bolsin.entity';
import { UbicacionBolsin } from './ubicacion-bolsin/ubicacion-bolsin.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    Rol,
    Empleado,
    ComisionMedica,
    Sesion,
    Estado,
    Bolsin,
    CambioEstadoBolsin,
    UbicacionBolsin,
  ],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('📦 Conectado a la base de datos');

  // ── ROLES ──────────────────────────────────────────────
  const rolEB = AppDataSource.getRepository(Rol).create({
    nombre: 'EB',
    descripcion: 'Encargado de Bolsines',
  });
  const rolGCM = AppDataSource.getRepository(Rol).create({
    nombre: 'GCM',
    descripcion: 'Gerente de Comision Medica',
  });
  await AppDataSource.getRepository(Rol).save([rolEB, rolGCM]);
  console.log('✅ Roles creados');

  // ── COMISIONES MEDICAS ─────────────────────────────────
  const cm1 = AppDataSource.getRepository(ComisionMedica).create({
    codigo: 'CM01',
    nombre: 'Comision Medica Buenos Aires',
    direccion: 'Av. Corrientes 1234, CABA',
    email: 'cm01@anses.gob.ar',
    telefono: '011-4444-1111',
  });
  const cm2 = AppDataSource.getRepository(ComisionMedica).create({
    codigo: 'CM02',
    nombre: 'Comision Medica Cordoba',
    direccion: 'Av. Colon 567, Cordoba',
    email: 'cm02@anses.gob.ar',
    telefono: '0351-4444-2222',
  });
  const cm3 = AppDataSource.getRepository(ComisionMedica).create({
    codigo: 'CM03',
    nombre: 'Comision Medica Rosario',
    direccion: 'Bv. Orono 890, Rosario',
    email: 'cm03@anses.gob.ar',
    telefono: '0341-4444-3333',
  });
  await AppDataSource.getRepository(ComisionMedica).save([cm1, cm2, cm3]);
  console.log('✅ Comisiones Medicas creadas');

  // ── EMPLEADOS ──────────────────────────────────────────
  const empleadoEB = AppDataSource.getRepository(Empleado).create({
    nombre: 'Juan',
    apellido: 'Perez',
    email: 'juan.perez@anses.gob.ar',
    rol: rolEB,
    asignadoA: cm1,
  });
  const gcmCM2 = AppDataSource.getRepository(Empleado).create({
    nombre: 'Maria',
    apellido: 'Lopez',
    email: 'maria.lopez@anses.gob.ar',
    rol: rolGCM,
    asignadoA: cm2,
  });
  const gcmCM3 = AppDataSource.getRepository(Empleado).create({
    nombre: 'Carlos',
    apellido: 'Garcia',
    email: 'carlos.garcia@anses.gob.ar',
    rol: rolGCM,
    asignadoA: cm3,
  });
  await AppDataSource.getRepository(Empleado).save([
    empleadoEB,
    gcmCM2,
    gcmCM3,
  ]);
  console.log('✅ Empleados creados');

  // ── SESION ─────────────────────────────────────────────
  const sesion = AppDataSource.getRepository(Sesion).create({
    usuario: empleadoEB,
  });
  await AppDataSource.getRepository(Sesion).save(sesion);
  console.log('✅ Sesion creada');

  // ── ESTADOS ────────────────────────────────────────────
  const estadoEnviado = AppDataSource.getRepository(Estado).create({
    nombre: 'Enviado',
    descripcion: 'Bolsin en transito entre comisiones',
    ambito: 'Transito',
  });
  const estadoRecibido = AppDataSource.getRepository(Estado).create({
    nombre: 'Recibido',
    descripcion: 'Bolsin recibido en destino',
    ambito: 'Destino',
  });
  await AppDataSource.getRepository(Estado).save([
    estadoEnviado,
    estadoRecibido,
  ]);
  console.log('✅ Estados creados');

  // ── BOLSINES ───────────────────────────────────────────
  const bolsin1 = AppDataSource.getRepository(Bolsin).create({
    fecha: new Date('2025-06-01'),
    numeroBolsin: 1001,
    numeroPrecinto: 'P-10011',
    peso: 2.5,
    origen: cm1,
    destino: cm2,
  });
  const bolsin2 = AppDataSource.getRepository(Bolsin).create({
    fecha: new Date('2025-06-02'),
    numeroBolsin: 1002,
    numeroPrecinto: 'P-10022',
    peso: 3.1,
    origen: cm1,
    destino: cm3,
  });
  const bolsin3 = AppDataSource.getRepository(Bolsin).create({
    fecha: new Date('2025-06-03'),
    numeroBolsin: 1003,
    numeroPrecinto: 'P-10033',
    peso: 1.8,
    origen: cm1,
    destino: cm2,
  });
  await AppDataSource.getRepository(Bolsin).save([bolsin1, bolsin2, bolsin3]);
  console.log('✅ Bolsines creados');

  // ── CAMBIOS DE ESTADO ──────────────────────────────────
  // bolsin1 y bolsin2 en estado Enviado (fechaHoraFin null = actual)
  // bolsin3 ya fue recibido (no debe aparecer en el CU36)
  const cambio1 = AppDataSource.getRepository(CambioEstadoBolsin).create({
    fechaHoraInicio: new Date('2025-06-01T08:00:00'),
    fechaHoraFin: null,
    estado: estadoEnviado,
    bolsin: bolsin1,
  });
  const cambio2 = AppDataSource.getRepository(CambioEstadoBolsin).create({
    fechaHoraInicio: new Date('2025-06-02T09:00:00'),
    fechaHoraFin: null,
    estado: estadoEnviado,
    bolsin: bolsin2,
  });
  const cambio3 = AppDataSource.getRepository(CambioEstadoBolsin).create({
    fechaHoraInicio: new Date('2025-06-03T10:00:00'),
    fechaHoraFin: new Date('2025-06-03T18:00:00'), // ya recibido
    estado: estadoRecibido,
    bolsin: bolsin3,
  });
  await AppDataSource.getRepository(CambioEstadoBolsin).save([
    cambio1,
    cambio2,
    cambio3,
  ]);
  console.log('✅ Cambios de estado creados');

  // ── UBICACIONES (mock GPSTracker) ──────────────────────
  const ubic1 = AppDataSource.getRepository(UbicacionBolsin).create({
    numeroBolsin: 1001,
    latitud: -34.6037,
    longitud: -58.3816,
    fechaHoraActualizacion: new Date('2025-06-01T10:30:00'),
    codigoCMOrigen: 'CM01',
    bolsin: bolsin1,
  });
  const ubic2 = AppDataSource.getRepository(UbicacionBolsin).create({
    numeroBolsin: 1002,
    latitud: -31.4135,
    longitud: -64.1811,
    fechaHoraActualizacion: new Date('2025-06-02T11:00:00'),
    codigoCMOrigen: 'CM01',
    bolsin: bolsin2,
  });
  await AppDataSource.getRepository(UbicacionBolsin).save([ubic1, ubic2]);
  console.log('✅ Ubicaciones GPS creadas');

  await AppDataSource.destroy();
  console.log('🎉 Seed completado exitosamente');
}

seed().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});