import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FondoService } from '../../core/service/fondo';
import { AuthService } from '../../core/service/auth.service'; 
import { Router, RouterLink } from '@angular/router';
import { ProfileSidebar } from './profile-sidebar/profile-sidebar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink, ProfileSidebar],
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

  irAlInicio(): void {
    this.authService.irAlInicio(this.router);
  }
}