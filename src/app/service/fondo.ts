import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root' 
})
export class FondoService {
  isOscuro = signal<boolean>(false);

  toggleFondo() {
    this.isOscuro.update(estado => !estado);
  }
}
