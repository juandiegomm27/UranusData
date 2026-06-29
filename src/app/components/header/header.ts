import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FondoService } from '../../service/fondo';
import { AuthService } from '../../service/auth.service'; // Importamos tu servicio de autenticación
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private fondoService = inject(FondoService);
  private router = inject(Router);
  
  // Debe ser public para que tu archivo HTML pueda usarlo de forma directa
  public authService = inject(AuthService);

  cambiarModo(): void {
    console.log('¡Botón pulsado! Estado actual:', this.fondoService.isOscuro());
    this.fondoService.toggleFondo();
    
    if (this.fondoService.isOscuro()) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

