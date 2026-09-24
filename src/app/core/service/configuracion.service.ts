import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  obtenerAjustes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ajustes`);
  }

  actualizarAjustes(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/ajustes`, data);
  }

  obtenerNotificaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notificaciones`);
  }

  marcarNotificacionLeida(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notificaciones/${id}/leer`, {});
  }
}