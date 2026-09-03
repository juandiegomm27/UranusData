import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root' 
})
export class FondoService {
  isOscuro = signal<boolean>(false);

  constructor() {
    this.inicializarModoOscuro();
    
    // Sincronizar cambios del signal con DOM y localStorage
    effect(() => {
      const oscuro = this.isOscuro();
      this.aplicarModoAlDOM(oscuro);
      localStorage.setItem('uranusdata-dark-mode', oscuro.toString());
    });
  }

  toggleFondo(): void {
    this.isOscuro.update(estado => !estado);
  }

  private inicializarModoOscuro(): void {
    // 1. Verificar si hay preferencia guardada en localStorage
    const modoGuardado = localStorage.getItem('uranusdata-dark-mode');
    
    if (modoGuardado !== null) {
      // Usar la preferencia guardada
      const activar = modoGuardado === 'true';
      this.isOscuro.set(activar);
    } else {
      // Si no hay preferencia, detectar la del sistema
      const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isOscuro.set(prefiereOscuro);
    }

    // Escuchar cambios del sistema operativo (si no hay preferencia guardada)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('uranusdata-dark-mode') === null) {
        this.isOscuro.set(e.matches);
      }
    });
  }

  private aplicarModoAlDOM(oscuro: boolean): void {
    if (oscuro) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}