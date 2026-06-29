import { Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // <-- IMPORTAR CLIENTE HTTP

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: '../section.css' 
})
export class RecuperarContrasena {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient); // <-- INYECTAR HTTP

  public codigoEnviado = signal<boolean>(false);

  recoveryForm = this.fb.group({
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

  onSubmit(): void {
    // FLUJO PASO 1: Comunicar con el servidor Node.js para mandar el correo real
    if (!this.codigoEnviado()) {
      const documentoValido = this.recoveryForm.get('documento')?.valid;
      const correoValido = this.recoveryForm.get('correo')?.valid;

      if (documentoValido && correoValido) {
        const payload = {
          documento: this.recoveryForm.get('documento')?.value,
          correo: this.recoveryForm.get('correo')?.value
        };

        console.log('Enviando datos al Backend...');

        // Hacemos la llamada HTTP POST al servidor local de Node.js
        this.http.post('http://localhost:3000/api/recuperar-contrasena', payload)
          .subscribe({
            next: (respuesta) => {
              console.log('Backend responde con éxito:', respuesta);
              // Avanzamos al paso de la nueva contraseña en la interfaz
              this.codigoEnviado.set(true);
            },
            error: (fallo) => {
              console.error('El servidor Backend rechazó la petición:', fallo);
              alert('Error al procesar la solicitud. Revisa la terminal del Backend.');
            }
          });
      } else {
        this.recoveryForm.get('documento')?.markAsTouched();
        this.recoveryForm.get('correo')?.markAsTouched();
      }
      return;
    }

    // FLUJO PASO 2: Confirmar las nuevas claves (Local en Angular)
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }

    console.log('¡Contraseña reestablecida localmente! Redirigiendo...');
    this.router.navigate(['/login']);
  }
}
