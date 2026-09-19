import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/inventario`;
  private apiAccesoriosUrl = `${environment.apiUrl}/inventario-accesorios`;

  constructor(private http: HttpClient) {}

  // --- ACTIVOS FIJOS ---
  obtenerElementos(pagina: number = 1, perPage: number = 10, search: string = '', tipo: string = '', estado: string = '', ubicacion: string = ''): Observable<any> {
    let params = new HttpParams().set('page', pagina.toString()).set('per_page', perPage.toString());
    if (search) params = params.set('search', search);
    if (tipo) params = params.set('tipo', tipo);
    if (estado) params = params.set('estado', estado);
    if (ubicacion) params = params.set('ubicacion', ubicacion);
    return this.http.get<any>(this.apiUrl, { params });
  }

  obtenerElemento(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crearElemento(elemento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, elemento);
  }

  actualizarElemento(id: number, elemento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, elemento);
  }

  darDeBajaElemento(id: number, payload: { motivo: string }) {
    return this.http.patch(`${this.apiUrl}/activos/${id}/dar-de-baja`, payload);
  }

  restaurarBaja(idBaja: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/inventario/historial-bajas-general/${idBaja}/restaurar`, {});
  }

  obtenerHistorialMantenimiento(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/historial`);
  }

  enviarMantenimiento(id: number, datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/mantenimiento`, datos);
  }

  // --- ACCESORIOS / STOCK POR LOTES ---
  obtenerAccesorios(pagina: number = 1, perPage: number = 10, search: string = '', tipo: string = '', ubicacion: string = ''): Observable<any> {
    let params = new HttpParams().set('page', pagina.toString()).set('per_page', perPage.toString());
    if (search) params = params.set('search', search);
    if (tipo) params = params.set('tipo', tipo);
    if (ubicacion) params = params.set('ubicacion', ubicacion);
    return this.http.get<any>(this.apiAccesoriosUrl, { params });
  }

  // ACTUALIZADO: Ahora indicamos explícitamente que recibe el id_stock de la ubicación
  darDeBajaAccesorio(id_stock: number, datos: { cantidad: number; motivo?: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/inventario/accesorios/${id_stock}/dar-de-baja`, datos);
  }

  // NUEVO: Método para trasladar stock entre salones o bodegas
  trasladarStock(datos: { id_stock_origen: number; cod_ubi_destino: number; cantidad: number }): Observable<any> {
    return this.http.post<any>(`${this.apiAccesoriosUrl}/trasladar`, datos);
  }

  obtenerHistorialBajasGeneral(tipo?: string): Observable<any> {
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<any>(`${environment.apiUrl}/inventario/historial-bajas-general`, { params });
  }

  crearAccesorio(accesorio: any): Observable<any> {
    return this.http.post<any>(this.apiAccesoriosUrl, accesorio);
  }

  actualizarAccesorio(id: number, accesorio: any): Observable<any> {
    return this.http.put<any>(`${this.apiAccesoriosUrl}/${id}`, accesorio);
  }

  eliminarAccesorio(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiAccesoriosUrl}/${id}`);
  }

  // --- OPCIONES GENERALES Y CATÁLOGOS ---
  obtenerOpciones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/opciones`);
  }

  crearUbicacion(datos: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/ubicaciones`, datos);
  }

  crearTipo(datos: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/tipos-elemento`, datos);
  }

  actualizarTipo(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/tipos-elemento/${id}`, datos);
  }

  eliminarTipo(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/tipos-elemento/${id}`);
  }

  eliminarUbicacion(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/ubicaciones/${id}`);
  }
}