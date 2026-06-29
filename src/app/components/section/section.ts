import { Component, inject, OnInit } from '@angular/core'; // <-- AGREGAR: OnInit
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service'; 
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './section.html',
  styleUrl: './section.css',
})
export class Section implements OnInit { // <-- AGREGAR: implements OnInit
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Forzar a limpiar la sesión vieja en cuanto cargue el formulario de Login
  ngOnInit(): void {
    this.authService.logout();
  }

  loginForm = this.fb.group({
    rol: ['Docente', [Validators.required]],
    documento: ['', [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const datosUsuario = this.loginForm.getRawValue();
    this.authService.login(datosUsuario.documento);
    this.router.navigate(['/home', datosUsuario.rol]);
  }
}

