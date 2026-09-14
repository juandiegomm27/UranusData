import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/inventario`;

  constructor(private http: HttpClient) {}

// Obtener elementos con filtros
  obtenerElementos(
    pagina: number = 1,
    perPage: number = 10,
    search: string = '',
    tipo: string = '',
    estado: string = '',
    ubicacion: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('per_page', perPage.toString());

    if (search) params = params.set('search', search);
    if (tipo) params = params.set('tipo', tipo);
    if (estado) params = params.set('estado', estado);
    if (ubicacion) params = params.set('ubicacion', ubicacion);

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Obtener un elemento por ID
  obtenerElemento(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Obtener historial de mantenimiento de un elemento específico
  obtenerHistorialMantenimiento(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/historial`);
  }

  // Crear elemento
  crearElemento(elemento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, elemento);
  }

  // Actualizar elemento
  actualizarElemento(id: number, elemento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, elemento);
  }

  // Eliminar elemento
  eliminarElemento(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Obtener opciones para filtros
  obtenerOpciones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/opciones`);
  }

  // Enviar a mantenimiento
  enviarMantenimiento(id: number, datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/mantenimiento`, datos);
  }

  // Crear nueva ubicación
  crearUbicacion(datos: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/ubicaciones`, datos);
  }

  // Crear nuevo tipo de elemento
  crearTipo(datos: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/tipos-elemento`, datos);
  }

  actualizarTipo(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/tipos-elemento/${id}`, datos);
  }

  eliminarTipo(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/tipos-elemento/${id}`);
  }

  // Eliminar ubicación
  eliminarUbicacion(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/ubicaciones/${id}`);
  }
}