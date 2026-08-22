import { Output, EventEmitter } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioGestorService } from '../../services/usuario-gestor.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-usuario.html',
  styleUrls: ['./crear-usuario.css']
})
export class CrearUsuario implements OnInit {
  documento: string = '';
  nombre: string = '';
  apellido: string = '';
  telefono: string = '';
  correo: string = '';
  cod_rol: number = 1;
  password: string = '';
  confirmPassword: string = '';

  roles: any[] = [];
  @Output() cerrar = new EventEmitter<void>();
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'success';

  constructor(
    private usuarioGestorService: UsuarioGestorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.usuarioGestorService.getRoles()
      .then((response: any) => {
        if (response.status === 'success') {
          this.roles = response.data;
        }
      })
      .catch((error: any) => {
        console.error('Error cargando roles:', error);
      });
  }

  crearUsuario(): void {
    // Validaciones
    if (!this.documento || !this.nombre || !this.apellido || !this.telefono || !this.correo || !this.password) {
      this.mostrarMensaje('Todos los campos son requeridos', 'error');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.mostrarMensaje('Las contraseñas no coinciden', 'error');
      return;
    }

    if (this.correo.indexOf('@') === -1) {
      this.mostrarMensaje('Ingresa un correo válido', 'error');
      return;
    }

    this.cargando = true;

    const datos = {
      documento: this.documento,
      nombre: this.nombre,
      apellido: this.apellido,
      cod_rol: Number(this.cod_rol), 
      password: this.password,
      telefono: this.telefono,
      correo: this.correo,
    };

    this.usuarioGestorService.crearUsuario(datos)
      .then((response: any) => {
        this.cargando = false;
        if (response.status === 'success') {
          this.mostrarMensaje('Usuario creado exitosamente. Se envió correo de verificación.', 'success');
          setTimeout(() => {
            this.cerrar.emit();
            this.router.navigate(['/modulos/gestion-usuarios']);
          }, 1000);
        }
      })
      .catch((error: any) => {
        this.cargando = false;
        this.mostrarMensaje('Error al crear usuario: ' + (error.message || 'Intenta nuevamente'), 'error');
      });
  }

  limpiarFormulario(): void {
    this.documento = '';
    this.nombre = '';
    this.apellido = '';
    this.telefono = '';
    this.correo = '';
    this.password = '';
    this.confirmPassword = '';
    this.cod_rol = 1;
    this.mensaje = '';
  }

  volver(): void {
    this.cerrar.emit();
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
}