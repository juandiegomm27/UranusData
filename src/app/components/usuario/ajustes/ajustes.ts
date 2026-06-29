import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ajustes.html',    
  styleUrl: '../../section/section.css'
})
export class Ajustes {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  settingsForm = this.fb.group({
    notificacionesEmail: [true],
    notificacionesPush: [false],
    idioma: ['es']
  });

  guardarAjustes(): void {
    console.log('Ajustes guardados:', this.settingsForm.getRawValue());
    alert('¡Configuraciones updated!');
  }

  irAlInicio(): void {
    this.authService.irAlInicio(this.router);
  }
}
