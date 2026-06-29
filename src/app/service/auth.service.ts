import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Validación de entorno seguro (Evita fallos si usas Angular moderno con SSR)
  private documentoInicial = typeof window !== 'undefined' ? localStorage.getItem('usuario_documento') : null;
  private rolInicial = typeof window !== 'undefined' ? localStorage.getItem('usuario_rol') : null;

  private usuarioDocumento = signal<string | null>(this.documentoInicial);
  private usuarioRol = signal<string | null>(this.rolInicial); 

  // comparecion con la informacion de la base de datos
  login(documento: string, rol: string): void {
    localStorage.setItem('usuario_documento', documento);
    localStorage.setItem('usuario_rol', rol); 
    
    this.usuarioDocumento.set(documento);
    this.usuarioRol.set(rol);
  }

  logout(): void {
    localStorage.removeItem('usuario_documento');
    localStorage.removeItem('usuario_rol'); 
    
    this.usuarioDocumento.set(null);
    this.usuarioRol.set(null);
  }

  getDocumento(): string | null {
    return this.usuarioDocumento();
  }

  // Retorna el rol activo
  getRol(): string | null {
    return this.usuarioRol();
  }

  isAutenticado(): boolean {
    return this.usuarioDocumento() !== null;
  }
}
