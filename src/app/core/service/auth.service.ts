import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  // Signals para datos de usuario (reactivos)
  private usuarioNombre = signal<string>('');
  private usuarioApellido = signal<string>('');
  private usuarioRol = signal<string>('');

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private obtenerCsrfToken(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/../sanctum/csrf-cookie`, {
      withCredentials: true
    });
  }

  login(documento: string, password: string): Observable<any> {
    return this.obtenerCsrfToken().pipe(
      switchMap(() => 
        this.http.post(`${this.apiUrl}/login`, {
          documento,
          password
        }, {
          withCredentials: true
        })
      )
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  logoutRemoto() {
    this.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.limpiarDatos();
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.limpiarDatos();
        this.router.navigate(['/login']);
      }
    });
  }

  obtenerPerfil(documento: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil/${documento}`);
  }

  validarUsuarioActivar(documento: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/activar/validar`, {
        documento: documento
      });
  }

  activarCuenta(documento: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/activar/cuenta`, {
      documento,
      password,
      confirmPassword
    });
  }

  solicitarRecuperacion(documento: string, correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recuperar-contrasena/solicitar`, {
      documento,
      correo
    });
  }

  verificarToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/recuperar-contrasena/verificar/${token}`);
  }

  verificarTokenRecuperacion(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/recuperar-contrasena/verificar/${token}`);
  }

  confirmarRecuperacion(token: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recuperar-contrasena/confirmar`, {
      token,
      password,
      confirmPassword
    });
  }

  isAutenticado(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método privado que actualiza los signals desde localStorage
  private actualizarDatosUsuario(): void {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const parsed = JSON.parse(usuario);
        this.usuarioNombre.set(parsed.nombre || '');
        this.usuarioApellido.set(parsed.apellido || '');
        this.usuarioRol.set(parsed.rol || 'Sin rol');
      } catch {
        this.limpiarDatos();
      }
    } else {
      this.limpiarDatos();
    }
  }

  // Limpia los datos cuando no hay usuario
  private limpiarDatos(): void {
    this.usuarioNombre.set('');
    this.usuarioApellido.set('');
    this.usuarioRol.set('Sin rol');
  }

  // Obtener signals directamente (para componentes)
  getNombreSignal() {
    this.actualizarDatosUsuario();
    return this.usuarioNombre;
  }

  getApellidoSignal() {
    this.actualizarDatosUsuario();
    return this.usuarioApellido;
  }

  getRolSignal() {
    this.actualizarDatosUsuario();
    return this.usuarioRol;
  }

  // Métodos originales (mantienen compatibilidad)
  getRol(): string {
    this.actualizarDatosUsuario();
    return this.usuarioRol();
  }

  getDocumento(): string {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const parsed = JSON.parse(usuario);
        return parsed.documento || '';
      } catch {
        return '';
      }
    }
    return '';
  }

  getNombre(): string {
    this.actualizarDatosUsuario();
    return this.usuarioNombre();
  }

  getApellido(): string {
    this.actualizarDatosUsuario();
    return this.usuarioApellido();
  }

  setNombreApellido(nombre: string, apellido: string) {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const parsed = JSON.parse(usuario);
        parsed.nombre = nombre;
        parsed.apellido = apellido;
        localStorage.setItem('usuario', JSON.stringify(parsed));
        this.actualizarDatosUsuario();
      } catch {
        console.error('Error al actualizar usuario');
      }
    }
  }

  irAlInicio(router: Router) {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const parsed = JSON.parse(usuario);
        const rol = parsed.rol || 'Docente';
        router.navigate(['/home', rol]);
      } catch {
        router.navigate(['/login']);
      }
    } else {
      router.navigate(['/login']);
    }
  }
}