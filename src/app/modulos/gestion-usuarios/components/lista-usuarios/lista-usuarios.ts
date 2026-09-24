import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioGestorService } from '../../services/usuario-gestor.service';
import { DetalleUsuario } from '../detalle-usuario/detalle-usuario';
import { HistorialReservas } from '../historial-reservas/historial-reservas';
import { CrearUsuario } from '../crear-usuario/crear-usuario';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/service/auth.service';
import { PaginationHelper } from '../../../shared/utils/pagination.helper';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleUsuario, HistorialReservas, CrearUsuario],
  templateUrl: './lista-usuarios.html',
  styleUrls: ['./lista-usuarios.css']
})
export class ListaUsuarios extends PaginationHelper implements OnInit {

  @ViewChild('crearUsuarioPanel') crearUsuarioPanel?: ElementRef<HTMLElement>;

  usuario: any[] = [];
  usuarioSeleccionado: any = null;
  estados: any[] = [];
  rol: any[] = [];
  estadosReserva: any[] = [];

  mostrarDetalleUsuario: boolean = false;
  mostrarHistorialReservas: boolean = false;
  mostrarCrearUsuario: boolean = false;

  filtroRol: string = '';
  filtroEstado: string = '';
  rolUsuario: string = '';

  constructor(
    private usuarioGestorService: UsuarioGestorService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    super();
    this.rolUsuario = this.authService.getRol();
  }

  ngOnInit(): void {
    if (this.rolUsuario !== 'Gerente') {
      this.router.navigate(['/home', this.rolUsuario]);
      return;
    }
    this.inicializarComponente();
  }
  
  inicializarComponente(): void {
    this.cargando = true;

    Promise.all([
      this.cargarEstados(),
      this.cargarrol(),
      this.cargarEstadosReserva()
    ]).then(() => {
      this.cargarDatos();
    }).catch((error) => {
      console.error('Error en inicialización:', error);
      this.cargando = false;
    });
  }

  cargarDatos(): void {
    this.cargando = true;
    const filtros = {
      rol: this.filtroRol,
      estado: this.filtroEstado,
      documento: this.terminoBusqueda
    };

    firstValueFrom(this.usuarioGestorService.getUsuarios(this.paginaActual, this.perPage, filtros))
      .then((response: any) => {
        this.usuario = (response.data || []).map((u: any) => ({
          ...u,
          correo: u.correos && u.correos.length > 0 ? u.correos[0].correo : null,
          telefono: u.telefonos && u.telefonos.length > 0 ? u.telefonos[0].telefono : null
        }));

        this.totalElementos = response.pagination?.total || 0;
        this.totalPaginas = response.pagination?.last_page || 0;
        this.paginaActual = response.pagination?.current_page || this.paginaActual;

        this.cargando = false;
        this.cdr.detectChanges();
      })
      .catch((error: any) => {
        console.error('Error cargando usuarios:', error);
        this.usuario = [];
        this.totalElementos = 0;
        this.totalPaginas = 0;
        this.cargando = false;
        this.cdr.detectChanges();
      });
  }

  cargarEstados(): Promise<void> {
    return new Promise((resolve) => {
      firstValueFrom(this.usuarioGestorService.getEstados())
        .then((response: any) => {
          if (response.success === true) {
            this.estados = response.data || [];
          }
          resolve();
        })
        .catch((error: any) => {
          console.error('Error cargando estados:', error);
          this.estados = [];
          resolve();
        });
    });
  }

  cargarrol(): Promise<void> {
    return new Promise((resolve) => {
      firstValueFrom(this.usuarioGestorService.getrol())
        .then((response: any) => {
          if (response.success === true) {
            this.rol = response.data || [];
          }
          resolve();
        })
        .catch((error: any) => {
          console.error('Error cargando roles:', error);
          this.rol = [];
          resolve();
        });
    });
  }

  cargarEstadosReserva(): Promise<void> {
    return Promise.resolve();
  }

  limpiarFiltros(): void {
    super.limpiarFiltrosBase();
    this.filtroRol = '';
    this.filtroEstado = '';
    this.cargarDatos();
  }

  abrirDetalleUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarDetalleUsuario = true;
  }

  cerrarDetalleUsuario(): void {
    this.mostrarDetalleUsuario = false;
    this.usuarioSeleccionado = null;
    this.cargarDatos();
  }

  abrirHistorialReservas(): void {
    this.mostrarHistorialReservas = true;
    this.mostrarDetalleUsuario = false;
  }

  cerrarHistorialReservas(): void {
    this.mostrarHistorialReservas = false;
  }

  abrirCrearUsuario(): void {
    this.mostrarCrearUsuario = true;
    this.mostrarDetalleUsuario = false;
    this.mostrarHistorialReservas = false;

    setTimeout(() => {
      this.crearUsuarioPanel?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  cerrarCrearUsuario(): void {
    this.mostrarCrearUsuario = false;
    this.cargarDatos();
  }

  bloquearUsuario(documento: string): void {
    if (confirm('¿Estás seguro de que deseas bloquear a este usuario?')) {
      firstValueFrom(this.usuarioGestorService.actualizarUsuario(documento, {
        cod_estado_usuario: 3 
      }))
      .then((response: any) => {
        if (response.status === 'success') {
          alert('Usuario bloqueado exitosamente');
          this.cargarDatos(); 
        }
      })
      .catch((error: any) => {
        console.error('Error bloqueando usuario:', error);
        alert('Error al bloquear usuario');
      });
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

  cerrarModalCrearYRecargar(): void {
    this.mostrarCrearUsuario = false;
    this.cargarDatos();
  }
}