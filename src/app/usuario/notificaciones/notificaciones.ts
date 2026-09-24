import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { ConfiguracionService } from '../../core/service/configuracion.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrl: '../../auth/login/login.css'
})
export class Notificaciones implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private configService = inject(ConfiguracionService);

  public alertas = signal<any[]>([]);
  public noLeidas = signal<number>(0);

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.configService.obtenerNotificaciones().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.alertas.set(res.data.notificaciones);
          this.noLeidas.set(res.data.no_leidas);
        }
      },
      error: (err) => console.error('Error cargando notificaciones:', err)
    });
  }

  marcarComoLeida(alerta: any): void {
    if (alerta.leida) return; // No hacer nada si ya está leída

    this.configService.marcarNotificacionLeida(alerta.id_notificacion).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Actualizamos la vista localmente sin recargar la página entera
          const actualizadas = this.alertas().map(n => 
            n.id_notificacion === alerta.id_notificacion ? { ...n, leida: true } : n
          );
          this.alertas.set(actualizadas);
          this.noLeidas.update(n => Math.max(0, n - 1));
        }
      }
    });
  }

  irAlInicio(): void {
    this.authService.irAlInicio(this.router);
  }
}