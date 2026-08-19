import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioGestorService } from '../../services/usuario-gestor.service';

@Component({
  selector: 'app-detalle-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-usuario.html',
  styleUrl: './detalle-usuario.css'
})
export class DetalleUsuario implements OnInit {
  @Input() usuario: any = null;
  @Input() estados: any[] = [];
  @Input() roles: any[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() verReservas = new EventEmitter<void>();

  private usuarioGestorService = inject(UsuarioGestorService);

  mostrarEdicion = false;
  cargando = false;
  usuarioEditando: any = null;

  ngOnInit(): void {
    this.inicializarEdicion();
  }

  inicializarEdicion(): void {
    if (this.usuario) {
      this.usuarioEditando = { ...this.usuario };
    }
  }

  toggleEdicion(): void {
    this.mostrarEdicion = !this.mostrarEdicion;
    if (!this.mostrarEdicion) {
      this.inicializarEdicion();
    }
  }

  guardarCambios(): void {
    if (!this.usuarioEditando.documento) return;

    this.cargando = true;
    const datos = {
      cod_estado_usuario: this.usuarioEditando.cod_estado_usuario
    };

    this.usuarioGestorService.actualizarUsuario(this.usuarioEditando.documento, datos)
      .then((response: any) => {
        this.cargando = false;
        if (response.status === 'success') {
          this.usuario.cod_estado_usuario = this.usuarioEditando.cod_estado_usuario;
          alert('Estado de usuario actualizado correctamente');
          this.mostrarEdicion = false;
        }
      })
      .catch((error: any) => {
        this.cargando = false;
        console.error('Error actualizando usuario:', error);
        alert('Error al actualizar el usuario');
      });
  }

  cancelarEdicion(): void {
    this.mostrarEdicion = false;
    this.inicializarEdicion();
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  onVerReservas(): void {
    this.verReservas.emit();
  }

  obtenerNombreRol(codRol: number): string {
    return this.roles.find(r => r.cod_rol === codRol)?.cargo || 'N/A';
  }

  obtenerNombreEstado(codEstado: number): string {
    return this.estados.find(e => e.cod_estado_usuario === codEstado)?.estado || 'N/A';
  }

  obtenerClaseEstado(codEstado: number): string {
    const estado = this.estados.find(e => e.cod_estado_usuario === codEstado)?.estado;
    if (estado === 'Activo') return 'estado-activo';
    if (estado === 'Inactivo') return 'estado-inactivo';
    if (estado === 'Bloqueado') return 'estado-bloqueado';
    return '';
  }
}