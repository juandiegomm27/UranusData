import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EstadoElemento {
  cod_estado_elemento: number;
  estado: string;
  total: number;
}

export interface PrestamoActivo {
  id_Reserva: number;
  documento: string;
  nombre: string;
  apellido?: string;
  id_elemento?: number;
  tipo?: string;
  fecha_inicio: string;
  fecha_entrega?: string | null;
  cantidad: number;
  elemento: string;
  estado_elementos?: EstadoElemento[];
  cod_estado_prestamo: number;
}

export interface PrestamosResponse {
  success: boolean;
  data: PrestamoActivo[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PrestamosActivosService {
  private baseUrl = `${environment.apiUrl}/gestion/usuario/prestamos-activos`;
  private reservaUrl = `${environment.apiUrl}/reserva`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de préstamos activos con paginación y filtros
   */
  obtenerPrestamosActivos(
    page: number = 1,
    perPage: number = 10,
    busqueda: string = '',
    estado: number | null = null,
    tipo: number | null = null
  ): Observable<PrestamosResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }

    if (estado !== null) {
      params = params.set('estado', estado.toString());
    }

    if (tipo !== null) {
      params = params.set('tipo', tipo.toString());
    }

    return this.http.get<PrestamosResponse>(this.baseUrl, { params });
  }

  /**
   * Obtener préstamos con paginación simple (compatibilidad)
   */
  obtenerPrestamos(pagina: number = 1): Observable<any> {
    const params = new HttpParams().set('page', pagina.toString());
    return this.http.get<any>(this.baseUrl, { params });
  }

  /**
   * Obtener detalles de un préstamo específico
   */
  obtenerDetallePrestamo(idReserva: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${idReserva}`);
  }

  /**
   * Actualizar estado de un préstamo
   * Estados: 1=Solicitado, 2=Entregado, 3=Devuelto, 4=Perdido, 5=Dañado
   */
  actualizarEstadoPrestamo(
    idReserva: number,
    nuevoEstado: number,
    observaciones?: string
  ): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/${idReserva}`,
      {
        cod_estado_prestamo: nuevoEstado,
        observaciones: observaciones || null
      }
    );
  }

  /**
   * Descargar préstamos como Excel o PDF
   */
  exportarPrestamos(formato: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/exportar?formato=${formato}`,
      { responseType: 'blob' }
    );
  }

  /**
   * Pasar una reserva "Solicitada" a préstamo entregado de verdad:
   * marca los equipos como en préstamo, descuenta stock y crea/actualiza
   * el registro de Prestamo. A diferencia de actualizarEstadoPrestamo,
   * esto sí aplica los efectos reales de la entrega.
   */
  entregarPrestamo(idReserva: number): Observable<any> {
    return this.http.post<any>(`${this.reservaUrl}/${idReserva}/entregar`, {});
  }
}