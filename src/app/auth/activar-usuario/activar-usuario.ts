import { Component, inject } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-activar-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './activar-usuario.html',
  styleUrl: '../login/login.css'
})
export class ActivarUsuario {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Control del flujo en 2 pasos
  pasoActual: number = 1;
  cargando: boolean = false;
  mensajeError: string = '';

  // Paso 1: Validación de Datos de Identidad
  datosForm = this.fb.group({
    primerNombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    apellidos: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    documento: ['', [Validators.required, Validators.minLength(5), Validators.pattern('^[0-9]*$')]],
    correo: ['', [Validators.required, Validators.email]],
    rol: ['1', [Validators.required]] 
  });

  // Paso 2: Cambio de Contraseña
  passwordForm = this.fb.group({
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

  // PASO 1: Validar identidad con el backend
  validarDatos(): void {
    this.mensajeError = '';
    
    if (this.datosForm.invalid) {
      this.datosForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const consulta = this.datosForm.getRawValue();

    // Reemplaza esta llamada con la función de tu AuthService que valida al usuario existente
    this.authService.validarUsuarioActivar(consulta)
      .then((respuesta: any) => {
        this.cargando = false;
        
        // Regla de Negocio: Si el usuario está bloqueado (estado 3)
        if (respuesta.cod_estado_usuario === 3 || respuesta.estado === 'Bloqueado') {
          this.mensajeError = 'Tu cuenta se encuentra BLOQUEADA. Por favor, ponte en contacto con el equipo de soporte técnico.';
          return;
        }

        // Si los datos son válidos, avanzamos al Paso 2
        this.pasoActual = 2;
      })
      .catch((err: any) => {
        this.cargando = false;
        this.mensajeError = err.error?.mensaje || 'Los datos ingresados no coinciden con nuestros registros o la cuenta no se puede activar.';
      });
  }

  // PASO 2: Confirmar nueva contraseña y activar la cuenta
  confirmarActivacion(): void {
    this.mensajeError = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const payload = {
      ...this.datosForm.getRawValue(),
      password: this.passwordForm.get('password')?.value,
      cod_estado_usuario: 1 // Forzamos el estado a ACTIVO (1)
    };

    // Petición al backend para actualizar clave y cambiar estado
    this.authService.activarCuenta(payload)
      .then(() => {
        this.cargando = false;
        alert('¡Cuenta activada y contraseña actualizada exitosamente! Ya puedes iniciar sesión.');
        this.router.navigate(['/login']);
      })
      .catch((err: any) => {
        this.cargando = false;
        this.mensajeError = err.error?.mensaje || 'Error al actualizar la contraseña en el servidor.';
      });
  }

  volverPasoUno(): void {
    this.pasoActual = 1;
    this.mensajeError = '';
  }
}