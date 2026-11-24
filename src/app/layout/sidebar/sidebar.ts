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

const DESCRIPCIONES_ROL: Record<string, string> = {
  Gerente: 'Acceso total al inventario y a los usuarios.',
  Tecnico: 'Inventario, mantenimiento y prestamos.',
  Docente: 'Consulta y reserva de equipos.'
};

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

  // Datos del usuario que muestra el boceto en el menu lateral
  readonly rol = this.authService.getRol();
  readonly nombre = this.construirNombre();
  readonly iniciales = this.construirIniciales();
  readonly descripcionRol = DESCRIPCIONES_ROL[this.rol] ?? 'Sesion activa en UranusData.';

  // Rutas reales definidas en app.routes.ts
  readonly rutaPerfil = ['/perfil/editar', this.authService.getDocumento()];
  readonly rutaAjustes = ['/usuario/ajustes'];

  enlaces = computed<EnlaceSidebar[]>(() => {
    const base: EnlaceSidebar[] = [
      { ruta: `/home/${this.rol}`, etiqueta: 'Inicio', icono: '/icons/home.svg' }
    ];

    if (this.rol === 'Gerente') {
      base.push(
        { ruta: '/modulos/gestion-usuarios', etiqueta: 'Usuarios', icono: '/icons/usuarios.svg' },
        { ruta: '/modulos/inventario', etiqueta: 'Inventario', icono: '/icons/inventario.svg' },
        { ruta: '/modulos/mantenimiento', etiqueta: 'Mantenimiento', icono: '/icons/mantenimiento.svg' },
        { ruta: '/prestamos/activos', etiqueta: 'Prestamos', icono: '/icons/prestamos.svg' },
      );
    } else if (this.rol === 'Tecnico') {
      base.push(
        { ruta: '/modulos/inventario', etiqueta: 'Inventario', icono: '/icons/inventario.svg' },
        { ruta: '/modulos/mantenimiento', etiqueta: 'Mantenimiento', icono: '/icons/mantenimiento.svg' },
        { ruta: '/prestamos/activos', etiqueta: 'Prestamos', icono: '/icons/prestamos.svg' },
      );
    } else if (this.rol === 'Docente') {
      base.push(
        { ruta: '/reserva/crear', etiqueta: 'Nueva reserva', icono: '/icons/mas.svg' },
        { ruta: '/reserva/consultar', etiqueta: 'Mis reservas', icono: '/icons/consultar.svg' },
        { ruta: '/reserva/editar', etiqueta: 'Editar reserva', icono: '/icons/editar.svg' }
      );
    }

    base.push({ ruta: '/usuario/contacto', etiqueta: 'Contacto', icono: '/icons/contacto.svg' });

    return base;
  });

  cerrarEnMobile(): void {
    this.sidebarService.cerrar();
  }

  salir(): void {
    this.sidebarService.cerrar();
    this.authService.logoutRemoto();
  }

  private construirNombre(): string {
    const nombre = this.authService.getNombre() || '';
    const apellido = this.authService.getApellido() || '';
    return `${nombre} ${apellido}`.trim() || 'Usuario';
  }

  private construirIniciales(): string {
    const nombre = this.authService.getNombre() || '';
    const apellido = this.authService.getApellido() || '';
    const letras = `${nombre.charAt(0)}${apellido.charAt(0)}`.trim();
    return (letras || 'U').toUpperCase();
  }
}
