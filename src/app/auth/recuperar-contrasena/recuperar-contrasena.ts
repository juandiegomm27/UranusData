import { Component, inject, signal, OnInit } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: '../login/login.css' 
})
export class RecuperarContrasena implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  public estado = signal<'solicitud' | 'validando' | 'formulario' | 'invalido'>('solicitud');
  public correoEnviado = signal<boolean>(false);
  private token: string | null = null;

  solicitudForm = this.fb.group({
    documento: ['', [Validators.required, Validators.minLength(5), Validators.pattern('^[0-9]*$')]],
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
      this.estado.set('validando');
      this.authService.verificarTokenRecuperacion(this.token)
        .then(() => this.estado.set('formulario'))
        .catch(() => this.estado.set('invalido'));
    }
  }

  onSolicitar(): void {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }

    const payload = this.solicitudForm.getRawValue();

    this.authService.solicitarRecuperacion(payload)
      .then(() => this.correoEnviado.set(true))
      .catch((fallo: any) => {
        alert(fallo.error?.mensaje || 'Error al procesar la solicitud.');
      });
  }

  onConfirmar(): void {
    if (this.nuevaPasswordForm.invalid) {
      this.nuevaPasswordForm.markAllAsTouched();
      return;
    }

    const payload = {
      token: this.token,
      password: this.nuevaPasswordForm.get('password')?.value
    };

    this.authService.confirmarRecuperacion(payload)
      .then(() => {
        alert('Tu contraseña fue actualizada correctamente.');
        this.router.navigate(['/login']);
      })
      .catch((fallo: any) => {
        alert(fallo.error?.mensaje || 'No se pudo actualizar la contraseña.');
      });
  }
}