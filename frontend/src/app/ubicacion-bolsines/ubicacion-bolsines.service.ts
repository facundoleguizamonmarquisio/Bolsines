import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UbicacionBolsinesService {
  private apiUrl = 'http://localhost:3000/gestor-ubicacion-bolsines';

  constructor(private http: HttpClient) {}

  // MSG 3: consultarUbicacionBolsin()
  consultarUbicacionBolsin(sesionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/consultar/${sesionId}`);
  }

  // MSG 30: tomarSelecBolsin()
  tomarSelecBolsin(sesionId: number, bolsinId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/seleccionar-bolsin`, {
      sesionId,
      bolsinId,
    });
  }

  // MSG 35: tomarConfirmacionEnvioCorreo()
  tomarConfirmacionEnvioCorreo(
    sesionId: number,
    bolsinId: number,
    confirma: boolean
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirmar-envio-correo`, {
      sesionId,
      bolsinId,
      confirma,
    });
  }
}