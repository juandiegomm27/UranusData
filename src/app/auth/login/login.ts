import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  
  // Convertimos las variables a Signals para reactividad instantánea
  cargando = signal<boolean>(false);
  error = signal<string>('');
  mostrarPassword = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      documento: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private intentosFallidos = 0;
  private readonly MAX_INTENTOS = 5;
  private readonly TIEMPO_BLOQUEO = 15 * 60 * 1000;
  private bloqueadoHasta: number = 0;

  ingresar() {
    this.error.set(''); // Resetea el mensaje de error

    if (this.intentosFallidos >= this.MAX_INTENTOS) {
      const ahora = Date.now();
      if (ahora < this.bloqueadoHasta) {
        const minutosRestantes = Math.ceil((this.bloqueadoHasta - ahora) / 60000);
        this.error.set(`Demasiados intentos. Intenta de nuevo en ${minutosRestantes} minuto(s)`);
        return;
      } else {
        this.intentosFallidos = 0;
      }
    }

    // Validar el formulario ANTES de extraer los datos
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marca los campos vacíos en rojo
      this.error.set('Completa todos los campos correctamente');
      return;
    }

    const documento = this.loginForm.get('documento')?.value;
    const password = this.loginForm.get('password')?.value;

    if (!documento || documento.length !== 10) {
      this.error.set('El documento debe tener exactamente 10 caracteres');
      return;
    }

    if (!password || password.length < 6 || password.length > 15) {
      this.error.set('La contraseña debe tener entre 6 y 15 caracteres');
      return;
    }

    this.cargando.set(true);

    this.authService.login(documento, password).subscribe({
      next: (response: any) => {
        if (response.usuario.cod_estado_usuario === 2) {
          this.error.set('Tu usuario está inactivo. Por favor contacta al administrador');
          this.intentosFallidos++;
          this.cargando.set(false);
          return;
        }

        if (response.usuario.cod_estado_usuario === 3) {
          this.error.set('Tu usuario está bloqueado. Por favor comunícate con soporte');
          this.intentosFallidos++;
          this.cargando.set(false);
          return;
        }

        if (response.usuario.cod_estado_usuario !== 1) {
          this.error.set('Estado de usuario no válido');
          this.intentosFallidos++;
          this.cargando.set(false);
          return;
        }

        this.intentosFallidos = 0;
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        this.router.navigate(['/home', response.usuario.rol]);
      },
      error: (err: any) => {
        console.error('Error al iniciar sesión:', err);
        this.error.set('Credenciales inválidas');
        this.intentosFallidos++;

        if (this.intentosFallidos >= this.MAX_INTENTOS) {
          this.bloqueadoHasta = Date.now() + this.TIEMPO_BLOQUEO;
          this.error.set('Demasiados intentos. Tu cuenta está bloqueada por 15 minutos');
        }

        this.cargando.set(false);
      }
    });
  }

  togglePassword() {
    this.mostrarPassword.set(!this.mostrarPassword());
  }

  onSubmit() {
    this.ingresar();
  }
}