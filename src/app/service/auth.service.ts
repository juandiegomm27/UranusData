import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Al iniciar, revisa si ya existía un documento guardado de antes
  private documentoInicial = localStorage.getItem('usuario_documento');
  private usuarioDocumento = signal<string | null>(this.documentoInicial);

  login(documento: string): void {
    // 1. Guardamos en el almacenamiento local del navegador (persistencia)
    localStorage.setItem('usuario_documento', documento);
    // 2. Actualizamos la señal reactiva
    this.usuarioDocumento.set(documento);
  }

  logout(): void {
    // 1. Borramos el dato del almacenamiento local
    localStorage.removeItem('usuario_documento');
    // 2. Limpiamos la señal
    this.usuarioDocumento.set(null);
  }

  getDocumento(): string | null {
    return this.usuarioDocumento();
  }

  isAutenticado(): boolean {
    return this.usuarioDocumento() !== null;
  }
}
