import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private apiUrl = `${environment.apiUrl}/mantenimiento`;

  constructor(private http: HttpClient) {}

  obtenerMantenimientos(pagina: number = 1): Observable<any> {
    const params = new HttpParams().set('page', pagina.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  obtenerMantenimiento(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crearMantenimiento(mantenimiento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, mantenimiento);
  }

  actualizarMantenimiento(id: number, mantenimiento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, mantenimiento);
  }

  completarMantenimiento(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/completar`, datos);
  }
}