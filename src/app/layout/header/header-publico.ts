import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FondoService } from '../../core/service/fondo';

@Component({
  selector: 'app-header-publico',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header-publico.html',
  styleUrl: './header.css',
})
export class HeaderPublico {
  menuAbierto = false;

  constructor(
    private fondoService: FondoService,
    private router: Router
  ) {}

  get modoOscuro(): boolean {
    return this.fondoService.isOscuro();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  cambiarModo(): void {
    this.fondoService.toggleFondo();
  }

  irAlInicio(): void {
    this.cerrarMenu();
    this.router.navigate(['/login']);
  }
}