import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-sidebar.html',
  styleUrl: './profile-sidebar.css'
})
export class ProfileSidebar implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);

  documento: string | null = null;
  nombre: string | null = null;
  apellido: string | null = null;
  rol: string | null = null;
  mostrarSidebar = false;

  ngOnInit(): void {
    this.documento = this.authService.getDocumento();
    this.nombre = this.authService.getNombre();
    this.apellido = this.authService.getApellido();
    this.rol = this.authService.getRol();
  }

  toggleSidebar(): void {
    this.mostrarSidebar = !this.mostrarSidebar;
  }

  cerrarSidebar(): void {
    this.mostrarSidebar = false;
  }

  irAMiInformacion(): void {
    this.cerrarSidebar();
    this.router.navigate(['/perfil/editar', this.documento]);
  }

  irAAjustes(): void {
    this.cerrarSidebar();
    this.router.navigate(['/usuario/ajustes']);
  }

  irANotificaciones(): void {
    this.cerrarSidebar();
    this.router.navigate(['/usuario/notificaciones']);
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}