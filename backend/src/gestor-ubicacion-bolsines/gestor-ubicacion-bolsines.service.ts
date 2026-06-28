import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { Sesion } from '../sesion/sesion.entity';
import { Bolsin } from '../bolsin/bolsin.entity';
import { Empleado } from '../empleado/empleado.entity';
import { UbicacionBolsin } from '../ubicacion-bolsin/ubicacion-bolsin.entity';
import { ComisionMedica } from '../comision-medica/comision-medica.entity';

@Injectable()
export class GestorUbicacionBolsinesService {
  // Atributos del Gestor (estado en memoria durante el CU)
  private usuario: Empleado;
  private nombreCMOrigen: string;
  private codigoCMOrigen: string;
  private bolsinesEnviadosCMOrigen: Bolsin[];
  private ubicacionesBolsinesEnviadosCMOrigen: UbicacionBolsin[];
  private mapaBolsinesEnviadosCMOrigen: any[];
  private bolsinSeleccionado: Bolsin | null;
  private decisionConfirmacionEnvioCorreo: boolean;
  private CMDestino: ComisionMedica;
  private GCMDestino: Empleado;
  private correoGCMDestino: string;

  private resend: Resend;

  constructor(
    @InjectRepository(Sesion)
    private sesionRepository: Repository<Sesion>,
    @InjectRepository(Bolsin)
    private bolsinRepository: Repository<Bolsin>,
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
    @InjectRepository(UbicacionBolsin)
    private ubicacionBolsinRepository: Repository<UbicacionBolsin>,
    private configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  // ── MSG 3: consultarUbicacionBolsin() ─────────────────
  async consultarUbicacionBolsin(sesionId: number) {
    // MSG 4: self obtenerUsuario()
    await this.obtenerUsuario(sesionId);

    // MSG 6: self obtenerCMUsuario()
    // MSG 7: Gestor → Empleado: mostrarCM()
    // MSG 8: Empleado → ComisionMedica: getNombre()
    // MSG 9: Empleado → ComisionMedica: getCodigo()
    await this.obtenerCMUsuario();

    // MSG 11: self buscarBolsinEnviadoSegunOrigen()
    await this.buscarBolsinEnviadoSegunOrigen();

    if (this.bolsinesEnviadosCMOrigen.length === 0) {
      // Flujo alternativo A1
      return {
        tipo: 'A1',
        mensaje: 'No se encontraron bolsines en estado Enviado',
        cmUsuario: {
          nombre: this.nombreCMOrigen,
          codigo: this.codigoCMOrigen,
        },
      };
    }

    // MSG 19: self obtenerUbicacionBolsin()
    await this.obtenerUbicacionBolsin();

    // MSG 22: self generarMapa()
    // MSG 23-24: genera datos para que el frontend los use con Leaflet
    await this.generarMapa();

    // MSG 25: self mostrarMapa()
    // MSG 26: retorna al frontend los datos para mostrarMapaBolsinParaSelec()
    // MSG 27: self habilitarBuscador()
    return {
      tipo: 'OK',
      cmUsuario: {
        nombre: this.nombreCMOrigen,  // MSG 10: mostrarCMUsuario()
        codigo: this.codigoCMOrigen,
      },
      bolsines: this.mapaBolsinesEnviadosCMOrigen, // MSG 26: mostrarMapaBolsinParaSelec()
      buscadorHabilitado: true,                    // MSG 28: habilitarBuscador()
    };
  }

  // ── MSG 4: obtenerUsuario() self ──────────────────────
  private async obtenerUsuario(sesionId: number): Promise<void> {
    // MSG 5: Gestor → Sesion: getUsuario()
    const sesion = await this.sesionRepository.findOne({
      where: { id: sesionId },
    });
    if (!sesion) throw new Error('Sesion no encontrada');
        this.usuario = sesion.getUsuario();
  }

  // ── MSG 6: obtenerCMUsuario() self ───────────────────
  private async obtenerCMUsuario(): Promise<void> {
    // MSG 7: Gestor → Empleado: mostrarCM()
    // MSG 8: Empleado → ComisionMedica: getNombre()
    // MSG 9: Empleado → ComisionMedica: getCodigo()
    const datosCM = this.usuario.mostrarCM();
    this.nombreCMOrigen = datosCM.nombre;
    this.codigoCMOrigen = datosCM.codigo;
  }

  // ── MSG 11: buscarBolsinEnviadoSegunOrigen() self ────
  private async buscarBolsinEnviadoSegunOrigen(): Promise<void> {
    // Trae todos los bolsines de la DB para iterar
    const todosBolsines = await this.bolsinRepository.find();
    this.bolsinesEnviadosCMOrigen = [];

    // Loop: MSG 12 al 18
    for (const bolsin of todosBolsines) {
      // MSG 12: Gestor → Bolsin: esTuCMOrigen()
      if (bolsin.esTuCMOrigen(this.codigoCMOrigen)) {
        // MSG 13: Gestor → Bolsin: sosEnviado()
        // MSG 14: Bolsin → CambioEstadoBolsin: sosEnviado()
        // MSG 15: CambioEstadoBolsin: sosActual()
        // MSG 16: CambioEstadoBolsin → Estado: esEnviado()
        if (bolsin.sosEnviado()) {
          // MSG 17: self obtenerDatosBolsin()
          // MSG 18: Gestor → Bolsin: getNumeroBolsin()
          this.bolsinesEnviadosCMOrigen.push(bolsin);
        }
      }
    }
  }

  // ── MSG 19: obtenerUbicacionBolsin() self ────────────
  private async obtenerUbicacionBolsin(): Promise<void> {
    this.ubicacionesBolsinesEnviadosCMOrigen = [];

    for (const bolsin of this.bolsinesEnviadosCMOrigen) {
      // MSG 20: Gestor → interfaz GPSTracker: getBolsinLocation()
      // MSG 21: GPSTracker mock → devuelve ubicacion desde DB
      const ubicacion = await this.getBolsinLocation(
        bolsin.getNumeroBolsin(),
        this.codigoCMOrigen,
      );
      if (ubicacion) {
        this.ubicacionesBolsinesEnviadosCMOrigen.push(ubicacion);
      }
    }
  }

  // ── MSG 20-21: interfaz Tracker getBolsinLocation() ──
  // Simula el endpoint del GPS Tracker XTR-4500L desde la DB
  private async getBolsinLocation(
    numeroBolsin: number,
    codigoCMOrigen: string,
  ): Promise<UbicacionBolsin | null> {
    return this.ubicacionBolsinRepository.findOne({
      where: { numeroBolsin, codigoCMOrigen },
    });
  }

  // ── MSG 22: generarMapa() self ───────────────────────
  // MSG 23-24: prepara datos para que Leaflet los consuma en el frontend
  private async generarMapa(): Promise<void> {
    this.mapaBolsinesEnviadosCMOrigen = this.bolsinesEnviadosCMOrigen.map(
      (bolsin) => {
        const ubicacion = this.ubicacionesBolsinesEnviadosCMOrigen.find(
          (u) => u.numeroBolsin === bolsin.getNumeroBolsin(),
        );
        return {
          id: bolsin.id,
          // MSG 18: getNumeroBolsin()
          numeroBolsin: bolsin.getNumeroBolsin(),
          numeroPrecinto: bolsin.numeroPrecinto,
          cmDestino: {
            // MSG 37 anticipado para mostrar en mapa
            nombre: bolsin.obtenerCMDestino().getNombre(),
            codigo: bolsin.obtenerCMDestino().getCodigo(),
          },
          latitud: ubicacion?.latitud,
          longitud: ubicacion?.longitud,
          fechaHoraActualizacion: ubicacion?.fechaHoraActualizacion,
        };
      },
    );
  }

  // ── MSG 30: tomarSelecBolsin() ───────────────────────
  async tomarSelecBolsin(sesionId: number, bolsinId: number) {
    console.log('sesionId:', sesionId, 'bolsinId:', bolsinId);
    await this.obtenerUsuario(sesionId);
    await this.obtenerCMUsuario();

    // Recupera el bolsin seleccionado
    this.bolsinSeleccionado = await this.bolsinRepository.findOne({
        where: { id: bolsinId },
    });
    if (!this.bolsinSeleccionado) throw new Error('Bolsin no encontrado');  

    // MSG 31: self consultarEnvioCorreo()
    // MSG 32-33: retorna al frontend para pedirConfirmacionEnvioCorreo()
    return {
      tipo: 'CONFIRMAR_CORREO',
      mensaje: '¿Desea enviar un correo al GCM destino?',
      bolsin: {
        numeroBolsin: this.bolsinSeleccionado.getNumeroBolsin(),
        numeroPrecinto: this.bolsinSeleccionado.numeroPrecinto,
        cmDestino: this.bolsinSeleccionado.obtenerCMDestino().getNombre(),
      },
    };
  }

  // ── MSG 35: tomarConfirmacionEnvioCorreo() ───────────
  async tomarConfirmacionEnvioCorreo(
    sesionId: number,
    bolsinId: number,
    confirma: boolean,
  ) {
    await this.obtenerUsuario(sesionId);

    this.bolsinSeleccionado = await this.bolsinRepository.findOne({
      where: { id: bolsinId },
    });
    if (!this.bolsinSeleccionado) throw new Error('Bolsin no encontrado');

    this.decisionConfirmacionEnvioCorreo = confirma;

    if (!confirma) {
      // Flujo alternativo A5
      return { tipo: 'A5', mensaje: 'Envío de correo cancelado' };
    }

    // MSG 36: self obtenerCorreoComisionDestino()
    await this.obtenerCorreoComisionDestino();

    // MSG 42: self enviarEmail()
    await this.enviarEmail();

    // MSG 43: self llamarCU31() — hace el envío con Resend
    await this.llamarCU31();

    // MSG 45: self informarExitoCU31()
    // MSG 46: retorna éxito al frontend
    return this.informarExitoCU31();
  }

  // ── MSG 36: obtenerCorreoComisionDestino() self ──────
  private async obtenerCorreoComisionDestino(): Promise<void> {
    // MSG 37: Gestor → bolsinSeleccionado: obtenerCMDestino()
    this.CMDestino = this.bolsinSeleccionado!.obtenerCMDestino();

    // Loop MSG 38-40: buscar GCM entre empleados en DB
    const todosEmpleados = await this.empleadoRepository.find();
    for (const empleado of todosEmpleados) {
      // MSG 38: Gestor → Empleado: esTuCM(cmDestino)
      if (empleado.esTuCM(this.CMDestino)) {
        // MSG 39: Gestor → Empleado: sosGCM()
        // MSG 40: Empleado → Rol: esGCM()
        if (empleado.sosGCM()) {
          this.GCMDestino = empleado;
          // MSG 41: Gestor → Empleado(GCM): getEmail()
          this.correoGCMDestino = empleado.getEmail();
          break;
        }
      }
    }
  }

  // ── MSG 42: enviarEmail() self ───────────────────────
  private async enviarEmail(): Promise<void> {
    // Prepara los datos, el envío real lo hace llamarCU31()
    const ubicacion = await this.getBolsinLocation(
      this.bolsinSeleccionado!.getNumeroBolsin(),
      this.bolsinSeleccionado!.origen.getCodigo(),
    );
    this['_datosEmailCU31'] = {
      correo: this.correoGCMDestino,
      numeroBolsin: this.bolsinSeleccionado!.getNumeroBolsin(),
      latitud: ubicacion?.latitud,
      longitud: ubicacion?.longitud,
      fechaHoraActualizacion: ubicacion?.fechaHoraActualizacion,
    };
  }

  // ── MSG 43: llamarCU31() self — envío real con Resend ─
  private async llamarCU31(): Promise<void> {
    const datos = this['_datosEmailCU31'];
    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: datos.correo,
      subject: `Ubicación del Bolsín Nro. ${datos.numeroBolsin}`,
      html: `
        <h2>Notificación de ubicación de Bolsín - CU31</h2>
        <p><strong>Número de Bolsín:</strong> ${datos.numeroBolsin}</p>
        <p><strong>Latitud:</strong> ${datos.latitud}</p>
        <p><strong>Longitud:</strong> ${datos.longitud}</p>
        <p><strong>Fecha y hora de última actualización:</strong> 
          ${new Date(datos.fechaHoraActualizacion).toLocaleString('es-AR')}
        </p>
      `,
    });
  }

  // ── MSG 45-46: informarExitoCU31() ───────────────────
  private informarExitoCU31() {
    // MSG 47: finCU()
    return {
      tipo: 'EXITO',
      mensaje: 'Correo enviado exitosamente al GCM destino',
      correoDestino: this.correoGCMDestino,
    };
  }
}