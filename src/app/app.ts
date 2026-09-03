import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderPublico } from './layout/header/header-publico';
import { HeaderPrivado } from './layout/header/header-privado';
import { FondoService } from './core/service/fondo';
import { AuthService } from './core/service/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderPublico, HeaderPrivado],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  rutaActual = '';
  rutasProtegidas = ['/home', '/modulos', '/perfil', '/usuario', '/prestamos-activos'];

  constructor(
    private router: Router,
    private fondoService: FondoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de ruta
    this.router.events.subscribe(() => {
      this.rutaActual = this.router.url;
    });

    // Aplicar modo oscuro SIN delay
    this.aplicarModoOscuro();

    // Observar cambios de modo oscuro
    setInterval(() => {
      this.aplicarModoOscuro();
    }, 500);
  }

  estaEnRutaProtegida(): boolean {
      if (this.authService.isAutenticado()) {
        return true;
      }
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