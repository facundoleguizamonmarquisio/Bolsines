import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent {
  constructor(private router: Router) {}

  // MSG 1: opcionConsultarUbicacionBolsin()
  opcionConsultarUbicacionBolsin(): void {
    this.router.navigate(['/ubicacion-bolsines']);
  }
}