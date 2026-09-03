import { Output, EventEmitter, Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  rol: any[] = [];

  @Output() cerrar = new EventEmitter<void>();
  
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'success';

  constructor(
    private usuarioGestorService: UsuarioGestorService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarrol();
  }

  cargarrol(): void {
    this.usuarioGestorService.getrol().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.rol = response.data;
          this.cdr.detectChanges(); 
        }
      },
      error: (error: any) => {
        console.error('Error cargando rol:', error);
      }
    });
  }

  crearUsuario(): void {
    if (!this.documento || !this.nombre || !this.apellido || !this.telefono || !this.correo) {
      this.mostrarMensaje('Todos los campos son requeridos', 'error');
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
      telefono: this.telefono,
      correo: this.correo,
    };

    this.usuarioGestorService.crearUsuario(datos).subscribe({
      next: (response: any) => {
        this.cargando = false;
        if (response.success) {
          this.mostrarMensaje('Usuario creado exitosamente. Estado: Inactivo.', 'success');
          this.cdr.detectChanges(); 
          setTimeout(() => {
            this.cerrar.emit();
          }, 1500);
        }
      },
      error: (err: any) => {
        console.log('Error recibido del servidor:', err); 
        
        this.cargando = false;

          if (err.status === 422 && err.error && err.error.errors) {
            const validaciones = err.error.errors;
            
            if (validaciones.documento) {
              this.mostrarMensaje('Error: Este documento ya está registrado.', 'error');
            } else if (validaciones.correo) {
              this.mostrarMensaje('Error: Este correo electrónico ya está en uso.', 'error');
            } else if (validaciones.telefono) { 
              this.mostrarMensaje('Error: Este número de teléfono ya está registrado.', 'error');
            } else {
              this.mostrarMensaje('Error de validación en los datos.', 'error');
            }
          } else {
            this.mostrarMensaje('Ocurrió un error inesperado. Verifica los datos o contacta a soporte técnico.', 'error');
          }
        
          this.cdr.detectChanges();
        
          this.cdr.detectChanges(); 
        }
    });
  }

  limpiarFormulario(): void {
    this.documento = '';
    this.nombre = '';
    this.apellido = '';
    this.telefono = '';
    this.correo = '';
    this.cod_rol = 1;
    this.mensaje = '';
    this.cdr.detectChanges();
  }

  volver(): void {
    this.cerrar.emit();
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges(); 
    
    setTimeout(() => {
      this.mensaje = '';
      this.cdr.detectChanges();
    }, 5000);
  }
}