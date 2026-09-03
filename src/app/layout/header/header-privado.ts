import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FondoService } from '../../core/service/fondo';
import { AuthService } from '../../core/service/auth.service';
import { ProfileSidebar } from './profile-sidebar/profile-sidebar';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-privado',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProfileSidebar],
  templateUrl: './header-privado.html',
  styleUrl: './header.css',
})
export class HeaderPrivado implements OnInit, OnDestroy {
  nombre = '';
  rol = '';
  menuAbierto = false;
  private subscription: Subscription | null = null;

  constructor(
    private fondoService: FondoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();

    this.subscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cargarDatos();
        this.cerrarMenu();
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private cargarDatos(): void {
    this.nombre = this.authService.getNombre() || '';
    this.rol = this.authService.getRol() || '';
  }

  get modoOscuro(): boolean {
    return this.fondoService.isOscuro();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  cambiarModo(): void {
    this.fondoService.toggleFondo();
  }

  irAlInicio(): void {
    this.cerrarMenu();
    this.authService.irAlInicio(this.router);
  }
}