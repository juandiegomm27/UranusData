import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderPublico } from './layout/header/header-publico';
import { HeaderPrivado } from './layout/header/header-privado';
import { Sidebar } from './layout/sidebar/sidebar';
import { FondoService } from './core/service/fondo';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderPublico, HeaderPrivado, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  rutaActual = '';
  rutasProtegidas = ['/home', '/modulos', '/perfil', '/usuario', '/prestamos-activos', '/prestamos', '/reserva'];

  constructor(
    private router: Router,
    private fondoService: FondoService
  ) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.rutaActual = this.router.url;
    });

    this.aplicarModoOscuro();
    setInterval(() => {
      this.aplicarModoOscuro();
    }, 500);
  }

  estaEnRutaProtegida(): boolean {
    return this.rutasProtegidas.some(ruta => this.rutaActual.startsWith(ruta));
  }

  private aplicarModoOscuro(): void {
    const pagina = document.querySelector('.pagina') as HTMLElement;
    if (!pagina) return;

    if (this.fondoService.isOscuro()) {
      pagina.classList.add('modo-oscuro');
      document.body.classList.add('dark-mode');
    } else {
      pagina.classList.remove('modo-oscuro');
      document.body.classList.remove('dark-mode');
    }
  }
}