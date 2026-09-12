// 1. src/app/modulos/prestamos/services/prestamos-activos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PrestamoActivo {
  id_reserva: number;
  documento: string;
  nombre: string;
  apellido?: string;
  elemento: string;
  tipo?: string;
  cantidad: number;
  fecha_inicio: string;
  fecha_entrega?: string;
  cod_estado_prestamo: number;
  estado_elementos?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PrestamosActivosService {
  // Ajusta la ruta base según tu api.php (por ejemplo, 'gestion/usuario/prestamos-activos' o 'prestamo')
  private apiUrl = `${environment.apiUrl}/gestion/usuario/prestamos-activos`;

  constructor(private http: HttpClient) {}

  obtenerPrestamos(pagina: number = 1): Observable<any> {
    const params = new HttpParams().set('page', pagina.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  actualizarEstadoPrestamo(idReserva: number, codEstadoPrestamo: number, observaciones?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idReserva}`, {
      cod_estado_prestamo: codEstadoPrestamo,
      observaciones: observaciones || ''
    });
  }
}