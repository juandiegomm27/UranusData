import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [],
  templateUrl: './notificaciones.html',
  styleUrl: '../../section/section.css'
})
export class Notificaciones {
  private router = inject(Router);
  private authService = inject(AuthService);

  public alertas = signal([
    { id: 1, mensaje: 'Tu solicitud de reserva para el Laboratorio A ha sido aprobada.', fecha: 'Hoy' },
    { id: 2, mensaje: 'El Técnico asignó mantenimiento preventivo al equipo serial #4401.', fecha: 'Ayer' }
  ]);

  irAlInicio(): void {
    if (this.authService.isAutenticado()) {
      const rolActual = this.authService.getRol();
      this.router.navigate(['/home', rolActual || 'Docente']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}

