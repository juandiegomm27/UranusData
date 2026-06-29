import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FondoService } from '../../service/fondo';
import { AuthService } from '../../service/auth.service'; // Trae el servicio de su archivo correcto
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink], // El servicio NO va aquí adentro, se inyecta abajo
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header { // <-- RESTAURADO: Esta es la clase que tu app.ts necesita encontrar
  private fondoService = inject(FondoService);
  private router = inject(Router);
  public authService = inject(AuthService); // Inyección limpia del servicio de autenticación

  cambiarModo(): void {
    this.fondoService.toggleFondo();
    if (this.fondoService.isOscuro()) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  // Evalúa si el usuario está logueado para mandarlo a su home o al login
  irAlInicio(): void {
    if (this.authService.isAutenticado()) {
      const rolActual = this.authService.getRol(); 
      this.router.navigate(['/home', rolActual || 'Docente']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
