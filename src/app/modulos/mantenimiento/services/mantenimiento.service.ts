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

  obtenerMantenimientos(pagina: number = 1, perPage: number = 10, busqueda: string = '', estado: string = '', tipo: string = '', fecha: string = ''): Observable<any> {
    let params = new HttpParams().set('page', pagina.toString()).set('per_page', perPage.toString());
    if (busqueda) params = params.set('busqueda', busqueda);
    if (estado) params = params.set('estado', estado);
    if (tipo) params = params.set('tipo', tipo);
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<any>(this.apiUrl, { params });
  }

  obtenerOpciones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/opciones`);
  }

  completarMantenimiento(id: number, observaciones: string, cod_estado_mantenimiento: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/completar`, { observaciones, cod_estado_mantenimiento });
  }
}