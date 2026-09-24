import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { ConfiguracionService } from '../../core/service/configuracion.service';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ajustes.html',
  styleUrl: '../../auth/login/login.css'
})
export class Ajustes implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private configService = inject(ConfiguracionService);

  cargando = false;

  settingsForm = this.fb.group({
    notificaciones_email: [true],
    notificaciones_push: [false],
    tema_oscuro: [false],
    idioma: ['es']
  });

  ngOnInit(): void {
    this.cargarAjustes();
  }

  cargarAjustes(): void {
    this.configService.obtenerAjustes().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.settingsForm.patchValue({
            notificaciones_email: res.data.notificaciones_email,
            notificaciones_push: res.data.notificaciones_push,
            tema_oscuro: res.data.tema_oscuro,
            idioma: res.data.idioma
          });
        }
      },
      error: (err) => console.error('Error cargando ajustes:', err)
    });
  }

  guardarAjustes(): void {
    this.cargando = true;
    this.configService.actualizarAjustes(this.settingsForm.getRawValue()).subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.success) {
          alert('¡Configuraciones actualizadas correctamente!');
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error guardando ajustes:', err);
        alert('Hubo un error al guardar las configuraciones.');
      }
    });
  }

  irAlInicio(): void {
    this.authService.irAlInicio(this.router);
  }
}