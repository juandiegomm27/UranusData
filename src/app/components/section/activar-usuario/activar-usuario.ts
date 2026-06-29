import { Component, inject } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-activar-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './activar-usuario.html',
  styleUrl: '../section.css' 
})
export class ActivarUsuario {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);

  // Formulario sincronizado con la vista incluyendo el nuevo control de correo
  activationForm = this.fb.group({
    rol: ['Docente', [Validators.required]],
    primerNombre: ['', [Validators.required]],
    segundoNombre: [''], 
    apellidos: ['', [Validators.required]],
    documento: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
    correo: ['', [Validators.required, Validators.email]], // <-- AGREGADO CON VALIDACIÓN DE EMAIL
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
      console.warn('Formulario de activación inválido.');
      return;
    }

    const datosNuevos = this.activationForm.getRawValue();
    console.log('¡Usuario registrado y activado con éxito! Datos cargados:', datosNuevos);
    
    this.router.navigate(['/login']);
  }
}

