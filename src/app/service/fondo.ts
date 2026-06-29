import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root' // Esto hace que esté disponible en toda tu aplicación
})
export class FondoService {
  isOscuro = signal<boolean>(false);

  toggleFondo() {
    this.isOscuro.update(estado => !estado);
  }
}
