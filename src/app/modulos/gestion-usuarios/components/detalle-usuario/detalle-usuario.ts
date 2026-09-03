import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioGestorService } from '../../services/usuario-gestor.service';

@Component({
  selector: 'app-detalle-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-usuario.html',
  styleUrls: ['./detalle-usuario.css']
})
export class DetalleUsuario {
  @Input() usuario: any = null;
  @Input() estados: any[] = [];
  @Input() rol: any[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() verReservas = new EventEmitter<void>();

  editando: boolean = false;
  cargando: boolean = false;
  estadoSeleccionado: number = 1;

  constructor(private usuarioGestorService: UsuarioGestorService) {}

  ngOnInit(): void {
    if (this.usuario) {
      this.estadoSeleccionado = this.usuario.cod_estado_usuario || 1;
    }
  }

  obtenerNombreEstado(codEstado: number): string {
    const estado = this.estados.find(e => e.cod_estado_usuario === codEstado);
    return estado ? estado.estado : 'N/A';
  }

  obtenerNombreRol(codRol: number): string {
    const rol = this.rol.find(r => r.cod_rol === codRol);
    return rol ? rol.cargo : 'N/A';
  }

  obtenerClaseEstado(codEstado: number): string {
    switch (codEstado) {
      case 1:
        return 'estado-activo';
      case 2:
        return 'estado-inactivo';
      case 3:
        return 'estado-bloqueado';
      default:
        return '';
    }
  }

  abrirEdicion(): void {
    this.editando = true;
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.estadoSeleccionado = this.usuario.cod_estado_usuario || 1;
  }

  guardarEstado(): void {
    this.cargando = true;

    this.usuarioGestorService.actualizarUsuario(this.usuario.documento, {
      cod_estado_usuario: this.estadoSeleccionado
    }).subscribe({
      next: (response: any) => {
        this.cargando = false;

        if (response?.status === 'success') {
          this.usuario.cod_estado_usuario = this.estadoSeleccionado;
          this.editando = false;
          alert('Estado actualizado exitosamente');
        }
      },
      error: (error: any) => {
        this.cargando = false;
        console.error('Error actualizando estado:', error);
        alert('Error al actualizar estado');
      }
    });
  }

  irAlHistorialReservas(): void {
    this.verReservas.emit();
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}