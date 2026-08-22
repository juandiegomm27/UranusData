import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service'; 
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit { 
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.authService.logout();
  }

  loginForm = this.fb.group({
    documento: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    recordarme: [false]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    const credenciales = this.loginForm.getRawValue();
    console.log('Consultando credenciales en Laravel...');

    this.authService.login(credenciales.documento, credenciales.password)
      .then(respuesta => {
      console.log('Acceso concedido por Laravel:', respuesta);
      this.router.navigate(['/home', respuesta.usuario.rol]);
    })
      .catch(fallo => {
        console.error('Acceso rechazado por Laravel:', fallo);
        alert(fallo.error?.mensaje || 'Error al conectar con la base de datos.');
      });
  }
}