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
  id_reserva: number;
  documento: string;
  nombre: string;
  id_elemento: number;
  tipo: string;
  fecha_inicio: string;
  fecha_entrega: string | null;
  cantidad: number;
  elemento: string;
  estado_elementos: EstadoElemento[];
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
  private baseUrl = `${environment.apiUrl}/gestion/usuarios/prestamos-activos`;

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
   * Descargar préstamos como Excel o PDF (opcional para futuro)
   */
  exportarPrestamos(formato: 'excel' | 'pdf'): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/exportar?formato=${formato}`,
      { responseType: 'blob' }
    );
  }
}