import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private esEntornoBrowser = typeof window !== 'undefined';
  private http = inject(HttpClient);

  private documentoInicial = this.esEntornoBrowser ? localStorage.getItem('usuario_documento') : null;
  private rolInicial = this.esEntornoBrowser ? localStorage.getItem('usuario_rol') : null;

  private usuarioDocumento = signal<string | null>(this.documentoInicial);
  private usuarioRol = signal<string | null>(this.rolInicial);

  login(documento: string, password: string): Promise<any> {
  return firstValueFrom(
    this.http.post<any>(`${environment.apiUrl}/login`, {
      documento,
      password
    })
  ).then(response => {
    if (response.status === 'success') {
      this.setLogin(response.usuario.documento, response.usuario.rol);
    }
    return response;
  });
  }

  register(datos: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/register`, datos)
    );
  }

  private setLogin(documento: string, rol: string): void {
    if (this.esEntornoBrowser) {
      localStorage.setItem('usuario_documento', documento);
      localStorage.setItem('usuario_rol', rol);
    }
    this.usuarioDocumento.set(documento);
    this.usuarioRol.set(rol);
  }

  logout(): void {
    if (this.esEntornoBrowser) {
      localStorage.removeItem('usuario_documento');
      localStorage.removeItem('usuario_rol');
      localStorage.removeItem('usuario_nombre');
      localStorage.removeItem('usuario_apellido');
    }
  this.usuarioDocumento.set(null);
  this.usuarioRol.set(null);
}

  getDocumento(): string | null {
    return this.usuarioDocumento();
  }

  getRol(): string | null {
    return this.usuarioRol();
  }

  getNombre(): string | null {
    return localStorage.getItem('usuario_nombre') || null;
  }

  getApellido(): string | null {
    return localStorage.getItem('usuario_apellido') || null;
  }

  setNombreApellido(nombre: string, apellido: string): void {
    if (this.esEntornoBrowser) {
      localStorage.setItem('usuario_nombre', nombre);
      localStorage.setItem('usuario_apellido', apellido);
    }
  }

  isAutenticado(): boolean {
    return this.usuarioDocumento() !== null;
  }

  irAlInicio(router: Router): void {
    if (this.isAutenticado()) {
      const rolActual = this.getRol();
      router.navigate(['/home', rolActual || 'Docente']);
    } else {
      router.navigate(['/login']);
    }
  }
}