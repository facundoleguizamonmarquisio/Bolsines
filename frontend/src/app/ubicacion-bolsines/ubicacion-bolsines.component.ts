import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { UbicacionBolsinesService } from './ubicacion-bolsines.service';


@Component({
  selector: 'app-ubicacion-bolsines',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ubicacion-bolsines.component.html',
  styleUrls: ['./ubicacion-bolsines.component.css'],
})
export class UbicacionBolsinesComponent implements OnInit, OnDestroy {
  // Atributos de PantallaUbicacionBolsines
  labelCMUsuario: string = '';
  mapaBolsin: L.Map | null = null;
  inputBuscador: string = '';
  bolsinSeleccionado: any = null;
  labelConsultaCorreo: string = '';
  buttonConfirmacionCorreo: boolean = false;
  dialogExitoCU31: boolean = false;
  dialogInexistenciaBolsinesEnviados: boolean = false;

  // Estado interno
  sesionId: number = 1; // En un sistema real vendría del login
  bolsines: any[] = [];
  bolsinesFiltrados: any[] = [];
  marcadores: L.Marker[] = [];
  cargando: boolean = false;
  mostrarConfirmacionCorreo: boolean = false;

  constructor(
  private gestorService: UbicacionBolsinesService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    // MSG 1: opcionConsultarUbicacionBolsin() — el usuario navega a esta pantalla
    // MSG 2: crearVentana() — OnInit es el equivalente
    this.crearVentana();
  }

  ngOnDestroy(): void {
    if (this.mapaBolsin) {
      this.mapaBolsin.remove();
    }
  }

  // MSG 2: crearVentana() self de Pantalla
  crearVentana(): void {
    // MSG 3: Pantalla → Gestor: consultarUbicacionBolsin()
    this.consultarUbicacionBolsin();
  }

  // MSG 3: invoca al backend
  consultarUbicacionBolsin(): void {
    this.cargando = true;
    this.gestorService.consultarUbicacionBolsin(this.sesionId).subscribe({
      next: (respuesta) => {
        this.cargando = false;

        if (respuesta.tipo === 'A1') {
          this.mostrarCMUsuario(respuesta.cmUsuario.nombre, respuesta.cmUsuario.codigo);
          this.mostrarMensajeDeInexistenciaBolsines();
          return;
        }
        // MSG 10: mostrarCMUsuario()
        this.mostrarCMUsuario(respuesta.cmUsuario.nombre, respuesta.cmUsuario.codigo);

        // MSG 26: mostrarMapaBolsinParaSelec()
        this.mostrarMapaBolsinParaSelec(respuesta.bolsines);

        // MSG 28: habilitarBuscador()
        this.habilitarBuscador();
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al consultar ubicacion:', err);
      },
    });
  }

  // Flujo A1: mostrarMensajeDeInexistenciaBolsines()
  mostrarMensajeDeInexistenciaBolsines(): void {
    this.dialogInexistenciaBolsinesEnviados = true;
    this.cdr.detectChanges();
  }

  // MSG 10: mostrarCMUsuario()
  mostrarCMUsuario(nombre: string, codigo: string): void {
    this.labelCMUsuario = `${nombre} (${codigo})`;
  }

  // MSG 26: mostrarMapaBolsinParaSelec()
  mostrarMapaBolsinParaSelec(bolsines: any[]): void {
  this.bolsines = bolsines;
  this.bolsinesFiltrados = [...bolsines];
  this.cdr.detectChanges();
  setTimeout(() => this.generarMapa(bolsines), 300);
}

  // MSG 28: habilitarBuscador()
  habilitarBuscador(): void {
    this.buttonConfirmacionCorreo = false;
    this.inputBuscador = '';
  }

  // Genera el mapa con Leaflet (equivalente MSG 23-24)
  generarMapa(bolsines: any[]): void {
    if (this.mapaBolsin) {
      this.mapaBolsin.remove();
      this.marcadores = [];
    }

    // Centra en Argentina por defecto
    this.mapaBolsin = L.map('mapa-bolsines').setView([-34.6037, -58.3816], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.mapaBolsin);

    // Icono personalizado para los marcadores
    const icono = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    bolsines.forEach((bolsin) => {
      if (bolsin.latitud && bolsin.longitud) {
        const marcador = L.marker([bolsin.latitud, bolsin.longitud], { icon: icono })
          .addTo(this.mapaBolsin!)
          .bindPopup(`
            <b>Bolsín Nro. ${bolsin.numeroBolsin}</b><br>
            Precinto: ${bolsin.numeroPrecinto}<br>
            Destino: ${bolsin.cmDestino.nombre}<br>
            Última actualización: ${new Date(bolsin.fechaHoraActualizacion).toLocaleString('es-AR')}
          `);

        // MSG 29: tomarSelecBolsin() cuando el usuario clickea un marcador
        marcador.on('click', () => {
          console.log('marcador clickeado, bolsin:', bolsin);
          this.tomarSelecBolsin(bolsin);
        });

        this.marcadores.push(marcador);
      }
    });
  }

  // Filtro por número de precinto o CM destino (habilitarBuscador)
  filtrarBolsines(): void {
    const termino = this.inputBuscador.toLowerCase();
    this.bolsinesFiltrados = this.bolsines.filter(
      (b) =>
        b.numeroPrecinto.toLowerCase().includes(termino) ||
        b.cmDestino.nombre.toLowerCase().includes(termino)
    );
    // Actualiza marcadores en el mapa
    this.generarMapa(this.bolsinesFiltrados);
  }

  // MSG 29-30: tomarSelecBolsin()
 tomarSelecBolsin(bolsin: any): void {
  this.gestorService.tomarSelecBolsin(this.sesionId, bolsin.id).subscribe({
    next: (respuesta) => {
      if (respuesta.tipo === 'CONFIRMAR_CORREO') {
        this.bolsinSeleccionado = respuesta.bolsin;
        this.pedirConfirmacionEnvioCorreo(respuesta.mensaje);
        this.cdr.detectChanges(); // fuerza actualización del DOM
      }
    },
    error: (err) => console.error('Error al seleccionar bolsin:', err),
  });
}

  // MSG 33: pedirConfirmacionEnvioCorreo()
  pedirConfirmacionEnvioCorreo(mensaje: string): void {
    this.labelConsultaCorreo = mensaje;
    this.mostrarConfirmacionCorreo = true;
  }

  // MSG 34: tomarConfirmacionEnvioCorreo() — usuario confirma
  tomarConfirmacionEnvioCorreo(): void {
  const bolsinId = this.getBolsinIdPorNumero(this.bolsinSeleccionado.numeroBolsin);
  this.mostrarConfirmacionCorreo = false;
  this.cdr.detectChanges();
  
  this.gestorService
    .tomarConfirmacionEnvioCorreo(this.sesionId, bolsinId, true)
    .subscribe({
      next: (respuesta) => {
        if (respuesta.tipo === 'EXITO') {
          this.informarExitoCU31(respuesta.mensaje);
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al confirmar envio:', err),
    });
}

  // tomarCancelacionEnvioCorreo() — usuario cancela (flujo A5)
  tomarCancelacionEnvioCorreo(): void {
  this.mostrarConfirmacionCorreo = false;
  this.bolsinSeleccionado = null;
  this.cdr.detectChanges();
}

  // MSG 46: informarExitoCU31()
  informarExitoCU31(mensaje: string): void {
    this.dialogExitoCU31 = true;
    this.labelConsultaCorreo = mensaje;
  }

  cerrarDialogExito(): void {
    this.dialogExitoCU31 = false;
  }

  cerrarDialogInexistencia(): void {
    this.dialogInexistenciaBolsinesEnviados = false;
  }

  private getBolsinIdPorNumero(numeroBolsin: number): number {
    const bolsin = this.bolsines.find((b) => b.numeroBolsin === numeroBolsin);
    return bolsin?.id ?? 0;
  }
}