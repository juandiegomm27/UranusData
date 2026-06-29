import { Component, inject } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-activar-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './activar-usuario.html',
  styleUrl: '../login/login.css'
})
export class ActivarUsuario {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient); 

  activationForm = this.fb.group({
    rol: ['Docente', [Validators.required]],
    primerNombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    apellidos: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    documento: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
    correo: ['', [Validators.required, Validators.email]], 
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

  onActivate(): void {
    if (this.activationForm.invalid) {
      this.activationForm.markAllAsTouched();
      return;
    }

    const datosNuevos = this.activationForm.getRawValue();
    console.log('Enviando registro a la base de datos...');

    this.http.post(`${environment.apiUrl}/activar-usuario`, datosNuevos)
      .subscribe({
        next: (respuesta) => {
          console.log('Usuario registrado y activado en el archivo JSON con éxito:', respuesta);
          alert('¡Usuario registrado con éxito! Ya puedes iniciar sesión de forma normal.');
          this.router.navigate(['/login']);
        },
        error: (fallo) => {
          console.error('Error al registrar en la BD:', fallo);
          alert(fallo.error?.mensaje || 'Error en el servidor backend.');
        }
      });
  }
}