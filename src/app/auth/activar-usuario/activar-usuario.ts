import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-activar-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './activar-usuario.html',
  styleUrls: ['../login/login.css']
})
export class ActivarUsuarioComponent implements OnInit {
  pasoActual: number = 1;
  mensajeError: string = '';
  cargando: boolean = false;
  datosForm!: FormGroup;
  passwordForm!: FormGroup;
  usuarioEncontrado: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.datosForm = this.fb.group({
      documento: ['', [Validators.required]],
      primerNombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      rol: ['', [Validators.required]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      verificarPassword: ['', [Validators.required]]
    });
  }

  validarDatos() {
    this.mensajeError = '';
    if (this.datosForm.invalid) {
      this.mensajeError = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.cargando = true;
    const documento = this.datosForm.get('documento')?.value;

    this.authService.validarUsuarioActivar(documento).subscribe({
      next: (respuesta: any) => {
        console.log('Usuario encontrado:', respuesta);
        this.usuarioEncontrado = respuesta.usuario;
        this.datosForm.patchValue({
          primerNombre: respuesta.usuario.nombre || '',
          apellidos: respuesta.usuario.apellido || '',
          correo: respuesta.usuario.correo || '',
          rol: respuesta.usuario.rol || ''
        });
        this.pasoActual = 2;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.mensajeError = 'Usuario no encontrado o datos inválidos';
        this.cargando = false;
      }
    });
  }

  irAlPaso3() {
    this.mensajeError = '';
    if (this.passwordForm.invalid) {
      this.mensajeError = 'Completa todos los campos de contraseña';
      return;
    }

    const password = this.passwordForm.get('password')?.value;
    const verificar = this.passwordForm.get('verificarPassword')?.value;

    if (password !== verificar) {
      this.passwordForm.setErrors({ mismatch: true });
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    this.pasoActual = 3;
  }

  activarCuenta() {
    this.mensajeError = '';
    this.cargando = true;

    const documento = this.datosForm.get('documento')?.value;
    const password = this.passwordForm.get('password')?.value;
    const confirmPassword = this.passwordForm.get('verificarPassword')?.value;

    this.authService.activarCuenta(documento, password, confirmPassword).subscribe({
      next: (respuesta: any) => {
        console.log('Cuenta activada:', respuesta);
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Error al activar:', err);
        this.mensajeError = 'No se pudo activar la cuenta. Intenta de nuevo';
        this.cargando = false;
      }
    });
  }

  volverPasoUno() {
    this.pasoActual = 1;
    this.mensajeError = '';
    this.datosForm.reset();
    this.passwordForm.reset();
  }

  confirmarActivacion() {
    this.activarCuenta();
  }
}