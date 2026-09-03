import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioGestorService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/gestion/usuario`;

  /**
   * Obtener lista de usuario con paginación y filtros
   */
  getUsuarios(
    page: number = 1,
    perPage: number = 10,
    filtros?: any
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (filtros?.rol) {
      params = params.set('rol', filtros.rol.toString());
    }
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado.toString());
    }
    if (filtros?.documento) {
      params = params.set('documento', filtros.documento);
    }
    if (filtros?.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }

    return this.http.get<any>(this.baseUrl, { params });
  }

  /**
   * Obtener usuario por documento
   */
  getUsuario(documento: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${documento}`);
  }

  /**
   * Crear nuevo usuario
   */
  crearUsuario(datos: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, datos);
  }

  /**
   * Actualizar usuario
   */
  actualizarUsuario(documento: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${documento}`, datos);
  }

  /**
   * Eliminar usuario
   */
  eliminarUsuario(documento: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${documento}`);
  }

  /**
   * Obtener lista de estados disponibles
   */
  getEstados(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/estados/list`);
  }

  /**
   * Obtener lista de rol disponibles
   */
  getrol(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/rol/list`);
  }

  /**
   * Obtener préstamos activos de un usuario
   */
  obtenerPrestamosActivos(
    page: number = 1,
    perPage: number = 10,
    filtros?: any
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (filtros?.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }
    if (filtros?.estado !== undefined && filtros.estado !== null) {
      params = params.set('estado', filtros.estado.toString());
    }

    return this.http.get<any>(`${this.baseUrl}/prestamos-activos`, { params });
  }

  /**
   * Actualizar estado de un préstamo
   */
  actualizarEstadoPrestamo(
    idReserva: number,
    nuevoEstado: number,
    observaciones?: string
  ): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/prestamos-activos/${idReserva}`,
      {
        cod_estado_prestamo: nuevoEstado,
        observaciones: observaciones || null
      }
    );
  }
}