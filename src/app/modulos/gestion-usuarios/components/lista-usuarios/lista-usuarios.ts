import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioGestorService } from '../../services/usuario-gestor.service';
import { AuthService } from '../../../../core/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Reservas del usuario
  reservasUsuario: any[] = [];
  estadosReserva: any[] = [];
  paginaReservas = 1;
  perPageReservas = 5;
  totalReservas = 0;
  totalPaginasReservas = 0;

  // Filtros de reservas
  filtroEstadoReserva = '';
  filtroElementoReserva = '';
  filtroFechaReserva = '';

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
    // Los estados ya se cargaron en cargarEstados()
    // Este método no es necesario si usamos la misma tabla
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
          this.cargarHistorialReservas(documento);
          this.mostrarDetalleUsuario = true;
        }
      })
      .catch((error: any) => {
        console.error('Error cargando detalles:', error);
        alert('Error al cargar información del usuario');
      });
  }

  cargarHistorialReservas(documento: string): void {
    const filtros = {
      estado: this.filtroEstadoReserva || undefined,
      elemento: this.filtroElementoReserva || undefined,
      fecha: this.filtroFechaReserva || undefined
    };

    // Por ahora dejamos vacío el historial de reservas
    // Se implementará en el siguiente paso
    this.reservasUsuario = [];
  }

  aplicarFiltroReservas(): void {
    this.paginaReservas = 1;
    this.cargarHistorialReservas(this.usuarioSeleccionado.documento);
  }

  cambiarPaginaReservas(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasReservas) {
      this.paginaReservas = pagina;
      this.cargarHistorialReservas(this.usuarioSeleccionado.documento);
    }
  }

  cerrarDetalleUsuario(): void {
    this.mostrarDetalleUsuario = false;
    this.usuarioSeleccionado = null;
    this.reservasUsuario = [];
    this.paginaReservas = 1;
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

  obtenerNombreEstadoReserva(numEstado: number): string {
    return this.estadosReserva.find(e => e.Num_estado === numEstado)?.estado || 'N/A';
  }

  obtenerClaseEstadoReserva(numEstado: number): string {
    const estado = this.estadosReserva.find(e => e.Num_estado === numEstado)?.estado;
    if (estado === 'Aprobada' || estado === 'Completada') return 'estado-aprobada';
    if (estado === 'Pendiente') return 'estado-pendiente';
    if (estado === 'Rechazada') return 'estado-rechazada';
    return '';
  }
}