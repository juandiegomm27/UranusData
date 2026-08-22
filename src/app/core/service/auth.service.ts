import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface UsuarioAutenticado {
  documento: string;
  nombre: string;
  apellido: string;
  rol: string;
  correo: string;
  telefono: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private esEntornoBrowser = typeof window !== 'undefined';
  private http = inject(HttpClient);

  private documentoInicial = this.esEntornoBrowser ? localStorage.getItem('usuario_documento') : null;
  private rolInicial = this.esEntornoBrowser ? localStorage.getItem('usuario_rol') : null;
  private usuarioInicial = this.esEntornoBrowser
    ? this.leerUsuarioGuardado()
    : null;

  private usuarioDocumento = signal<string | null>(this.documentoInicial);
  private usuarioRol = signal<string | null>(this.rolInicial);
  private usuarioActual = signal<UsuarioAutenticado | null>(this.usuarioInicial);

  login(documento: string, password: string): Promise<any> {
  return firstValueFrom(
    this.http.post<any>(`${environment.apiUrl}/login`, {
      documento,
      password
    })
  ).then(response => {
    if (response.status === 'success') {
        this.setLogin(response.usuario);
    }
    return response;
  });
  }

  register(datos: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/register`, datos)
    );
  }

  validarUsuarioActivar(datos: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/activar/validar`, datos)
    );
  }

  activarCuenta(datos: any): Promise<any> {
    return firstValueFrom(
      this.http.put<any>(`${environment.apiUrl}/activar`, datos)
    );
  }

  solicitarRecuperacion(datos: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/recuperar-contrasena/solicitar`, datos)
    );
  }

  verificarTokenRecuperacion(token: string): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/recuperar-contrasena/verificar/${token}`)
    );
  }

  confirmarRecuperacion(datos: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/recuperar-contrasena/confirmar`, datos)
    );
  }

  private setLogin(usuario: UsuarioAutenticado): void {
    if (this.esEntornoBrowser) {
      localStorage.setItem('usuario_documento', usuario.documento);
      localStorage.setItem('usuario_rol', usuario.rol);
      localStorage.setItem('usuario_nombre', usuario.nombre);
      localStorage.setItem('usuario_apellido', usuario.apellido);
      localStorage.setItem('usuario_actual', JSON.stringify(usuario));
    }
    this.usuarioDocumento.set(usuario.documento);
    this.usuarioRol.set(usuario.rol);
    this.usuarioActual.set(usuario);
  }

  logout(): void {
    if (this.esEntornoBrowser) {
      localStorage.removeItem('usuario_documento');
      localStorage.removeItem('usuario_rol');
      localStorage.removeItem('usuario_nombre');
      localStorage.removeItem('usuario_apellido');
      localStorage.removeItem('usuario_actual');
    }
  this.usuarioDocumento.set(null);
  this.usuarioRol.set(null);
  this.usuarioActual.set(null);
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

  getUsuario(): UsuarioAutenticado | null {
    return this.usuarioActual();
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

  private leerUsuarioGuardado(): UsuarioAutenticado | null {
    const usuarioGuardado = localStorage.getItem('usuario_actual');

    if (!usuarioGuardado) return null;

    try {
      return JSON.parse(usuarioGuardado) as UsuarioAutenticado;
    } catch {
      localStorage.removeItem('usuario_actual');
      return null;
    }
  }
}