import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FondoService } from '../../core/service/fondo';
import { AuthService } from '../../core/service/auth.service';
import { SidebarService } from '../../core/service/sidebar.service';
import { ProfileSidebar } from './profile-sidebar/profile-sidebar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header-privado',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileSidebar],
  templateUrl: './header-privado.html',
  styleUrl: './header.css',
})
export class HeaderPrivado implements OnInit {
  nombre = '';
  rol = '';

  constructor(
    private fondoService: FondoService,
    private authService: AuthService,
    private router: Router,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cargarDatos();
        this.sidebarService.cerrar();
      });
  }

  private cargarDatos(): void {
    this.nombre = this.authService.getNombre() || '';
    this.rol = this.authService.getRol() || '';
  }

  get modoOscuro(): boolean {
    return this.fondoService.isOscuro();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  cambiarModo(): void {
    this.fondoService.toggleFondo();
  }

  irAlInicio(): void {
    this.authService.irAlInicio(this.router);
  }
}