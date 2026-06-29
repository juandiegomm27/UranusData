import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private esEntornoBrowser = typeof window !== 'undefined';

  private documentoInicial = this.esEntornoBrowser ? localStorage.getItem('usuario_documento') : null;
  private rolInicial = this.esEntornoBrowser ? localStorage.getItem('usuario_rol') : null;

  private usuarioDocumento = signal<string | null>(this.documentoInicial);
  private usuarioRol = signal<string | null>(this.rolInicial); 

  login(documento: string, rol: string): void {
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