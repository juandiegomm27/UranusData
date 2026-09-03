import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/service/auth.service';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-sidebar.html',
  styleUrl: './profile-sidebar.css'
})
export class ProfileSidebar implements OnInit {
  documento = signal<string>('');
  nombre = signal<string>('');
  apellido = signal<string>('');
  rol = signal<string>('');
  mostrarSidebar = signal<boolean>(false);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Cargar datos SIN delay
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.documento.set(this.authService.getDocumento());
    this.nombre.set(this.authService.getNombre());
    this.apellido.set(this.authService.getApellido());
    this.rol.set(this.authService.getRol());
  }

  toggleSidebar(): void {
    this.mostrarSidebar.set(!this.mostrarSidebar());
    // Cerrar hamburguesa cuando se abre el sidebar
    if (this.mostrarSidebar()) {
      this.cerrarHamburguesa();
    }
  }
  
  private cerrarHamburguesa(): void {
    const checkbox = document.getElementById('menu-toggle-private') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
    }
  }

  cerrarSidebar(): void {
    this.mostrarSidebar.set(false);
  }

  irAMiInformacion(): void {
    this.cerrarSidebar();
    this.router.navigate(['/perfil/editar', this.documento()]);
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
    this.cerrarSidebar();
    this.authService.logoutRemoto();
  }
}