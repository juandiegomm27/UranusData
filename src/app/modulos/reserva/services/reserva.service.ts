import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * El docente no elige marca/modelo/serial de un equipo concreto, solo el
 * tipo y cuántos necesita — la unidad física se asigna sola al confirmar.
 */
export interface TipoElementoDisponible {
  cod_tipo_elemento: number;
  tipo: string;
  cantidad_disponible: number;
}

export interface AccesorioDisponible {
  id_stock: number;
  id_accesorio: number;
  cantidad_disponible: number;
  accesorio?: { nombre: string; modelo?: string };
  ubicacion?: { ubicacion: string };
}

export interface DetalleReservaPayload {
  cod_tipo_elemento?: number;
  id_stock?: number;
  cantidad: number;
}

export interface ReservaDetalle {
  id_detalle: number;
  id_elemento: number | null;
  id_stock: number | null;
  cod_tipo_elemento: number | null;
  cantidad_solicitada: number;
  cantidad_entregada: number;
  cantidad_devuelta: number;
  elemento?: { nombre_elemento: string };
  stock?: { accesorio?: { nombre: string } };
  tipo?: { tipo: string };
}

export type EstadoCalculadoReserva = 'activa' | 'no_recogida' | 'en_prestamo' | 'historial' | 'rechazada';

export interface Reserva {
  id_Reserva: number;
  Num_estado: number;
  documento: string;
  fecha: string;
  plazo: string | null;
  estado?: { Num_estado: number; estado: string };
  detalles?: ReservaDetalle[];
  prestamo?: any;
  estado_calculado?: EstadoCalculadoReserva;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/mis-reserva`;
  private catalogoUrl = `${environment.apiUrl}/catalogo`;

  constructor(private http: HttpClient) {}

  obtenerMisReservas(perPage: number = 50): Observable<any> {
    const params = new HttpParams().set('per_page', perPage.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  crearReserva(fecha: string, plazo: string, detalles: DetalleReservaPayload[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, { fecha, plazo, detalles });
  }

  actualizarReserva(id: number, datos: { fecha?: string; plazo?: string; detalles?: DetalleReservaPayload[] }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, datos);
  }

  cancelarReserva(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  obtenerEstados(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/reservas/estados`);
  }

  obtenerTiposElemento(): Observable<any> {
    return this.http.get<any>(`${this.catalogoUrl}/tipos-elemento`);
  }

  obtenerElementosDisponibles(search: string = '', tipo: string = ''): Observable<any> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<any>(`${this.catalogoUrl}/elementos-disponibles`, { params });
  }

  obtenerAccesoriosDisponibles(search: string = '', tipo: string = ''): Observable<any> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<any>(`${this.catalogoUrl}/accesorios-disponibles`, { params });
  }
}
