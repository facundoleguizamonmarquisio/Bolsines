import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { UbicacionBolsinesComponent } from './ubicacion-bolsines/ubicacion-bolsines.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'ubicacion-bolsines', component: UbicacionBolsinesComponent },
];