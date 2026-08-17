import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { ProfileService } from '../../core/service/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-perfil.html',
  styleUrl: '../../auth/login/login.css'
})
export class EditarPerfil implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  documento: string | null = null;
  cargando = false;
  mensajeExito = '';
  mostrarMensajeExito = false;

  perfilForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern('^[0-9]{10,15}$|^$')]],
    password: [''],
    verificarPassword: ['']
  }, {
    validators: this.passwordMatchValidator
  });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const verificarPassword = control.get('verificarPassword')?.value;
    
    if (!password && !verificarPassword) {
      return null;
    }
    
    return password === verificarPassword ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.documento = this.authService.getDocumento();
    
    if (!this.documento) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarPerfil();
  }

  cargarPerfil(): void {
    if (!this.documento) return;

    this.profileService.getProfile(this.documento)
      .then(response => {
        if (response.status === 'success') {
          this.perfilForm.patchValue({
            nombre: response.usuario.nombre,
            apellido: response.usuario.apellido,
            correo: response.usuario.correo,
            telefono: response.usuario.telefono || ''
          });
        }
      })
      .catch(error => {
        console.error('Error cargando perfil:', error);
        alert('Error al cargar la información del perfil');
      });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    if (!this.documento) return;

    this.cargando = true;
    const datos = this.perfilForm.getRawValue();

    this.profileService.updateProfile(this.documento, datos)
      .then(response => {
        this.cargando = false;
        if (response.status === 'success') {
          this.authService.setNombreApellido(datos.nombre, datos.apellido);
          this.mensajeExito = '¡Perfil actualizado correctamente! Se envió un correo de confirmación.';
          this.mostrarMensajeExito = true;
          
          setTimeout(() => {
            this.mostrarMensajeExito = false;
            this.perfilForm.get('password')?.reset();
            this.perfilForm.get('verificarPassword')?.reset();
          }, 3000);
        }
      })
      .catch(error => {
        this.cargando = false;
        console.error('Error actualizando perfil:', error);
        alert(error.error?.mensaje || 'Error al actualizar el perfil');
      });
  }

  regresar(): void {
    this.router.navigate(['/home', this.authService.getRol()]);
  }

  obtenerUrlGravatar(): string {
    const correo = this.perfilForm.get('correo')?.value || '';
    const hash = this.md5(correo.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}?s=80&d=identicon`;
  }

  private md5(str: string): string {
    // Implementación simple de MD5 para Gravatar
    // En producción, usar una librería
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}