import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [],
  templateUrl: './notificaciones.html',
  styleUrl: '../../auth/login/login.css'
})
export class Notificaciones {
  private router = inject(Router);
  private authService = inject(AuthService);

  public alertas = signal([
    { id: 1, mensaje: 'Tu solicitud de reserva para el Laboratorio A ha sido aprobada.', fecha: 'Hoy' },
    { id: 2, mensaje: 'El Técnico asignó mantenimiento preventivo al equipo serial #4401.', fecha: 'Ayer' }
  ]);

  irAlInicio(): void {
    this.authService.irAlInicio(this.router);
  }
}

