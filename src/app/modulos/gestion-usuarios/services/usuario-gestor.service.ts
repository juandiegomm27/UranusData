import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioGestorService {
  private http = inject(HttpClient);

  getUsuarios(page: number = 1, perPage: number = 10, filtros?: any): Promise<any> {
    let params = `?page=${page}&per_page=${perPage}`;
    
    if (filtros?.rol) params += `&rol=${filtros.rol}`;
    if (filtros?.estado) params += `&estado=${filtros.estado}`;
    if (filtros?.documento) params += `&documento=${filtros.documento}`;

    return firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/gestion/usuarios${params}`)
    );
  }

  getUsuario(documento: string): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/gestion/usuarios/${documento}`)
    );
  }

  crearUsuario(datos: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/gestion/usuarios`, datos)
    );
  }

  actualizarUsuario(documento: string, datos: any): Promise<any> {
    return firstValueFrom(
      this.http.put<any>(`${environment.apiUrl}/gestion/usuarios/${documento}`, datos)
    );
  }

  eliminarUsuario(documento: string): Promise<any> {
    return firstValueFrom(
      this.http.delete<any>(`${environment.apiUrl}/gestion/usuarios/${documento}`)
    );
  }

  getEstados(): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/gestion/usuarios/estados/list`)
    );
  }

  getRoles(): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/gestion/usuarios/roles/list`)
    );
  }
}