import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [ReactiveFormsModule], // CAMBIADO: Reemplaza FormsModule por ReactiveFormsModule para habilitar [formGroup]
  templateUrl: './section.html',
  styleUrl: './section.css',
})
export class Section {
  private fb = inject(NonNullableFormBuilder);
    loginForm = this.fb.group({
    documento: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  
  onSubmit(): void {
     if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      
      console.warn('Formulario inválido. Revisa las restricciones de los campos.');
      return;
    }

    const datosUsuario = this.loginForm.getRawValue();
    console.log('¡Validación exitosa! Formulario enviado correctamente:', datosUsuario);
    
    }
}