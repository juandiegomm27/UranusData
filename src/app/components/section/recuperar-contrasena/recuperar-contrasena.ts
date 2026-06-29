import { Component, inject, signal, OnInit } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: '../section.css' 
})
export class RecuperarContrasena implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient); 

  // Estados: solicitud (paso 1), validando token, formulario (paso 2), token inválido
  public estado = signal<'solicitud' | 'validando' | 'formulario' | 'invalido'>('solicitud');
  public correoEnviado = signal<boolean>(false);
  private token: string | null = null;

  solicitudForm = this.fb.group({
    documento: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
    correo: ['', [Validators.required, Validators.email]]
  });

  nuevaPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    verificarPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const verificarPassword = control.get('verificarPassword')?.value;
    return password === verificarPassword ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');

    if (this.token) {
      // Llegó desde el enlace del correo: validar el token contra el backend
      this.estado.set('validando');
      this.http.get(`${environment.apiUrl}/recuperar-contrasena/verificar/${this.token}`)
        .subscribe({
          next: () => this.estado.set('formulario'),
          error: () => this.estado.set('invalido')
        });
    }
  }

  // Paso 1: solicitar el enlace de recuperación
  onSolicitar(): void {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }

    const payload = this.solicitudForm.getRawValue();

    this.http.post(`${environment.apiUrl}/recuperar-contrasena/solicitar`, payload)
      .subscribe({
        next: () => {
          this.correoEnviado.set(true);
        },
        error: (fallo) => {
          alert(fallo.error?.mensaje || 'Error al procesar la solicitud.');
        }
      });
  }

  // Paso 2: confirmar la nueva contraseña usando el token
  onConfirmar(): void {
    if (this.nuevaPasswordForm.invalid) {
      this.nuevaPasswordForm.markAllAsTouched();
      return;
    }

    const payload = {
      token: this.token,
      password: this.nuevaPasswordForm.get('password')?.value
    };

    this.http.post(`${environment.apiUrl}/recuperar-contrasena/confirmar`, payload)
      .subscribe({
        next: () => {
          alert('Tu contraseña fue actualizada correctamente.');
          this.router.navigate(['/login']);
        },
        error: (fallo) => {
          alert(fallo.error?.mensaje || 'No se pudo actualizar la contraseña.');
        }
      });
  }
}