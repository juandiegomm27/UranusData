import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  abierto = signal<boolean>(false);

  toggle(): void {
    this.abierto.update(v => !v);
  }

  cerrar(): void {
    this.abierto.set(false);
  }
}