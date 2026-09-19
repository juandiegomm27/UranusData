import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { SidebarService } from '../../core/service/sidebar.service';

interface EnlaceSidebar {
  ruta: string;
  etiqueta: string;
  icono: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private authService = inject(AuthService);
  public sidebarService = inject(SidebarService);

  private rol = this.authService.getRol();

  enlaces = computed<EnlaceSidebar[]>(() => {
    const base: EnlaceSidebar[] = [
      { ruta: `/home/${this.rol}`, etiqueta: 'Inicio', icono: '/icons/home.svg' }
    ];

    if (this.rol === 'Gerente') {
      base.push(
        { ruta: '/modulos/inventario', etiqueta: 'Inventario', icono: '/icons/inventario.svg' },
        { ruta: '/modulos/gestion-usuarios', etiqueta: 'Usuarios', icono: '/icons/usuarios.svg' },
        { ruta: '/modulos/mantenimiento', etiqueta: 'Mantenimiento', icono: '/icons/mantenimiento.svg' },
        { ruta: '/prestamos/activos', etiqueta: 'Préstamos', icono: '/icons/prestamos.svg' },
      );
    } else if (this.rol === 'Tecnico') {
      base.push(
        { ruta: '/modulos/inventario', etiqueta: 'Inventario', icono: '/icons/inventario.svg' },
        { ruta: '/modulos/mantenimiento', etiqueta: 'Mantenimiento', icono: '/icons/mantenimiento.svg' },
        { ruta: '/prestamos/activos', etiqueta: 'Préstamos', icono: '/icons/prestamos.svg' },
      );
    } else if (this.rol === 'Docente') {
      base.push(
        { ruta: '/reserva/consultar', etiqueta: 'Mis reservas', icono: '/icons/consultar.svg' }
      );
    }

base.push({ ruta: '/usuario/contacto', etiqueta: 'Contacto', icono: '/icons/contacto.svg' });
    
    return base;
  });

  cerrarEnMobile(): void {
    this.sidebarService.cerrar();
  }
}