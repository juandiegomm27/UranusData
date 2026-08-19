import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetalleUsuario } from '../detalle-usuario/detalle-usuario';
import { HistorialReservas } from '../historial-reservas/historial-reservas';
import { UsuarioGestorService } from '../../services/usuario-gestor.service';
import { AuthService } from '../../../../core/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleUsuario, HistorialReservas],
  templateUrl: './lista-usuarios.html',
  styleUrl: './lista-usuarios.css'
})
export class ListaUsuarios implements OnInit {
  private usuarioGestorService = inject(UsuarioGestorService);
  private authService = inject(AuthService);
  private router = inject(Router);

  usuarios: any[] = [];
  roles: any[] = [];
  estados: any[] = [];
  estadosReserva: any[] = [];
  
  paginaActual = 1;
  perPage = 10;
  totalUsuarios = 0;
  totalPaginas = 0;

  // Filtros
  filtroDocumento = '';
  filtroRol = '';
  filtroEstado = '';
  
  // Modal
  mostrarModalCrear = false;
  mostrarDetalleUsuario = false;
  usuarioSeleccionado: any = null;
  mostrarHistorialReservas = false;

  // Validación
  rolUsuario = this.authService.getRol();
  cargando = false;

  ngOnInit(): void {
    if (this.rolUsuario !== 'Gerente') {
      this.router.navigate(['/home', this.rolUsuario]);
      return;
    }

    this.cargarEstados();
    this.cargarRoles();
    this.cargarEstadosReserva();
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    const filtros = {
      rol: this.filtroRol || undefined,
      estado: this.filtroEstado || undefined,
      documento: this.filtroDocumento || undefined
    };

    this.usuarioGestorService.getUsuarios(this.paginaActual, this.perPage, filtros)
      .then((response: any) => {
        this.cargando = false;
        if (response.status === 'success') {
          this.usuarios = response.data;
          this.totalUsuarios = response.total;
          this.totalPaginas = response.last_page;
        }
      })
      .catch((error: any) => {
        this.cargando = false;
        console.error('Error cargando usuarios:', error);
        alert('Error al cargar usuarios');
      });
  }

  cargarRoles(): void {
    this.usuarioGestorService.getRoles()
      .then((response: any) => {
        if (response.status === 'success') {
          this.roles = response.data;
        }
      })
      .catch((error: any) => console.error('Error cargando roles:', error));
  }

  cargarEstados(): void {
    this.usuarioGestorService.getEstados()
      .then((response: any) => {
        if (response.status === 'success') {
          this.estados = response.data;
        }
      })
      .catch((error: any) => console.error('Error cargando estados:', error));
  }

  cargarEstadosReserva(): void {
    this.usuarioGestorService.getEstadosReserva()
      .then((response: any) => {
        if (response.status === 'success') {
          this.estadosReserva = response.data;
        }
      })
      .catch((error: any) => console.error('Error cargando estados de reserva:', error));
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargarUsuarios();
  }

  aplicarFiltro(): void {
    this.paginaActual = 1;
    this.cargarUsuarios();
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarUsuarios();
    }
  }

  cambiarPerPage(cantidad: number): void {
    this.perPage = cantidad;
    this.paginaActual = 1;
    this.cargarUsuarios();
  }

  abrirDetalleUsuario(documento: string): void {
  this.usuarioGestorService.getUsuario(documento)
    .then((response: any) => {
      if (response.status === 'success') {
        this.usuarioSeleccionado = response.usuario;
        this.mostrarDetalleUsuario = true;
      }
    })
    .catch((error: any) => {
      console.error('Error cargando detalles:', error);
      alert('Error al cargar información del usuario');
    });
}

abrirHistorialReservas(): void {
  this.mostrarHistorialReservas = true;
  this.mostrarDetalleUsuario = false;
}

  cerrarDetalleUsuario(): void {
  this.mostrarDetalleUsuario = false;
  this.usuarioSeleccionado = null;
  }

  cerrarHistorialReservas(): void {
    this.mostrarHistorialReservas = false;
  }

  eliminarUsuario(documento: string): void {
    if (confirm('¿Seguro deseas eliminar este usuario?')) {
      this.usuarioGestorService.eliminarUsuario(documento)
        .then((response: any) => {
          if (response.status === 'success') {
            alert('Usuario eliminado correctamente');
            this.cargarUsuarios();
          }
        })
        .catch((error: any) => {
          console.error('Error eliminando usuario:', error);
          alert('Error al eliminar usuario');
        });
    }
  }

  abrirModalCrear(): void {
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
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