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
  styleUrls: ['../../auth/login/login.css', './editar-perfil.css']
})
export class EditarPerfil implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  documentoSesion: string | null = null;
  documentoOriginal: string = ''; 
  cargando = false;
  mensajeExito = '';
  mostrarMensajeExito = false;

  perfilForm = this.fb.group({
    documento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    nombre: ['', [Validators.required, Validators.pattern('^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$')]],
    apellido: ['', [Validators.required, Validators.pattern('^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$')]],
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
    this.documentoSesion = this.authService.getDocumento();
    
    if (!this.documentoSesion) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarPerfil();
  }

  cargarPerfil(): void {
    if (!this.documentoSesion) return;

    this.profileService.getProfile(this.documentoSesion)
      .then((response: any) => {
        if (response.success) {
          const user = response.data; 
          this.documentoOriginal = user.documento;
          
          this.perfilForm.patchValue({
            documento: user.documento,
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correos && user.correos.length > 0 ? user.correos[0].correo : '',
            telefono: user.telefonos && user.telefonos.length > 0 ? user.telefonos[0].telefono : ''
          });
        }
      })
      .catch((error: any) => {
        console.error('Error cargando perfil:', error);
        window.alert('Error al cargar la información del perfil');
      });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    const datos = this.perfilForm.getRawValue();
    
    const cambioDocumento = datos.documento !== this.documentoOriginal;
    const cambioPassword = !!datos.password;

    if (cambioDocumento && !cambioPassword) {
      window.alert('¡Alerta de Seguridad!\nSi decide cambiar su número de documento de identidad, por seguridad está obligado a actualizar también su contraseña.');
      return;
    }

    let mensajeConfirmacion = '¿Está seguro de que desea cambiar sus datos personales?';
    let requiereReinicioSesion = false;

    if (cambioDocumento) {
      mensajeConfirmacion = '¡Atención!\nHa modificado su número de documento y contraseña. Por seguridad, su sesión se cerrará y deberá iniciar sesión nuevamente con sus nuevas credenciales.\n\n¿Desea aceptar y continuar?';
      requiereReinicioSesion = true;
    } else if (cambioPassword) {
      mensajeConfirmacion = '¡Atención!\nHa modificado su contraseña. Por seguridad, su sesión se cerrará y deberá iniciar sesión nuevamente.\n\n¿Desea aceptar y continuar?';
      requiereReinicioSesion = true;
    } else {
      mensajeConfirmacion = 'Se van a actualizar sus datos personales en el sistema. ¿Desea continuar?';
    }

    if (!window.confirm(mensajeConfirmacion)) {
      return;
    }

    this.cargando = true;
    if (!this.documentoSesion) return;

    this.profileService.updateProfile(this.documentoSesion, datos)
      .then((response: any) => {
        this.cargando = false;
        
        if (response.success) {
          if (requiereReinicioSesion) {
            window.alert('Credenciales actualizadas exitosamente. Redirigiendo al login...');
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            this.router.navigate(['/login']);
            return;
          }

          this.authService.setNombreApellido(datos.nombre, datos.apellido);
          this.documentoOriginal = datos.documento;
          this.mensajeExito = '¡Perfil actualizado correctamente!';
          this.mostrarMensajeExito = true;
          
          this.perfilForm.patchValue({
            password: '',
            verificarPassword: ''
          });
          this.perfilForm.get('password')?.markAsUntouched();
          this.perfilForm.get('verificarPassword')?.markAsUntouched();

          setTimeout(() => {
            this.mostrarMensajeExito = false;
          }, 3500);
        }
      })
      .catch((error: any) => {
        this.cargando = false;
        console.error('Error actualizando perfil:', error);
        window.alert(error.error?.mensaje || 'Error al actualizar el perfil');
      });
  }

  regresar(): void {
    this.router.navigate(['/home', this.authService.getRol()]);
  }
}