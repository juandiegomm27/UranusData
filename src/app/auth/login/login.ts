import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service'; 
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { environment } from '../../../environments/environment';

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
  private http = inject(HttpClient); 

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
    console.log('Consultando credenciales en la base de datos modular...');

    this.http.post<{ status: string, usuario: { documento: string, rol: string } }>(
      `${environment.apiUrl}/login`, 
      credenciales
    ).subscribe({
      next: (respuesta) => {
        console.log('Acceso concedido por la BD:', respuesta);
        this.authService.login(respuesta.usuario.documento, respuesta.usuario.rol);
        this.router.navigate(['/home', respuesta.usuario.rol]);
      },
      error: (fallo) => {
        console.error('Acceso rechazado por la BD:', fallo);
        alert(fallo.error?.mensaje || 'Error al conectar con la base de datos.');
      }
    });
  }
}