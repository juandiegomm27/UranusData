import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FondoService } from '../../service/fondo';
import { AuthService } from '../../service/auth.service'; 
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header { 
  private fondoService = inject(FondoService);
  private router = inject(Router);
  public authService = inject(AuthService); 
  
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
    this.authService.irAlInicio(this.router);
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
