import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar-contrasena.html',
  styleUrls: ['../login/login.css']
})
export class RecuperarContrasenaComponent implements OnInit {
  estado = signal('solicitud'); 
  correoEnviado = signal<boolean>(false);
  solicitudForm!: FormGroup;
  nuevaPasswordForm!: FormGroup;
  cargando = signal(false);
  error = signal('');
  token: string = '';
  mostrarPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.solicitudForm = this.fb.group({
      documento: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]]
    });

    this.nuevaPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      verificarPassword: ['', [Validators.required]]
    });

    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
        this.estado.set('validando'); 
        this.verificarToken();
      }
    });
  }

  onSolicitar() {
    this.error.set('');
    if (this.solicitudForm.invalid) {
      this.error.set('Completa todos los campos correctamente');
      return;
    }
    
    this.cargando.set(true);
    const documento = this.solicitudForm.get('documento')?.value;
    const correo = this.solicitudForm.get('correo')?.value;
    
    this.authService.solicitarRecuperacion(documento, correo).subscribe({
      next: (respuesta: any) => {
        console.log('Recuperación solicitada:', respuesta);
        this.estado.set('solicitud'); 
        this.correoEnviado.set(true);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.error.set(err.error?.mensaje || 'No se pudo enviar el correo de recuperación');
        this.cargando.set(false);
      }
    });
  }

  private verificarToken() {
    this.cargando.set(true);
    this.authService.verificarToken(this.token).subscribe({
      next: (respuesta: any) => {
        console.log('Token válido:', respuesta);
        this.estado.set('formulario'); 
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.error.set('El enlace ha expirado o es inválido');
        this.estado.set('invalido'); 
        this.cargando.set(false);
      }
    });
  }

  onConfirmar() {
    this.error.set('');
    if (this.nuevaPasswordForm.invalid) {
      this.error.set('Completa todos los campos correctamente');
      return;
    }

    const password = this.nuevaPasswordForm.get('password')?.value;
    const verificarPassword = this.nuevaPasswordForm.get('verificarPassword')?.value;

    if (password !== verificarPassword) {
      this.nuevaPasswordForm.setErrors({ mismatch: true });
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.cargando.set(true);
    this.authService.confirmarRecuperacion(this.token, password, verificarPassword).subscribe({
      next: (respuesta: any) => {
        console.log('Contraseña actualizada:', respuesta);
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.error.set('No se pudo cambiar la contraseña');
        this.cargando.set(false);
      }
    });
  }

  togglePassword() {
    this.mostrarPassword.set(!this.mostrarPassword());
  }
}