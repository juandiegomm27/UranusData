import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './section.html',
  styleUrl: './section.css',
})
export class Section {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    rol: ['Docente', [Validators.required]], 
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
    
    // 1. Guardamos el documento en el estado global
    this.authService.login(datosUsuario.documento);
    
    console.log('¡Validación exitosa! Datos:', datosUsuario);
    
    // 2. Redirección dinámica usando el rol capturado
    // Esto mandará a rutas como: /home/Docente, /home/Tecnico o /home/Gerente
    this.router.navigate(['/home', datosUsuario.rol]);
  }

}
