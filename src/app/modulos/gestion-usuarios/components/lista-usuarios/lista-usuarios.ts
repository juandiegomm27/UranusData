import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioGestorService } from '../../services/usuario-gestor.service';
import { DetalleUsuario } from '../detalle-usuario/detalle-usuario';
import { HistorialReservas } from '../historial-reservas/historial-reservas';
import { CrearUsuario } from '../crear-usuario/crear-usuario';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleUsuario, HistorialReservas, CrearUsuario],
  templateUrl: './lista-usuarios.html',
  styleUrls: ['./lista-usuarios.css']
})
export class ListaUsuarios implements OnInit {

  @ViewChild('crearUsuarioPanel') crearUsuarioPanel?: ElementRef<HTMLElement>;

  //   VARIABLES DE DATOS  
  usuarios: any[] = [];
  usuarioSeleccionado: any = null;
  estados: any[] = [];
  roles: any[] = [];
  estadosReserva: any[] = [];

  //   VARIABLES DE CONTROL  
  cargando: boolean = true;
  mostrarDetalleUsuario: boolean = false;
  mostrarHistorialReservas: boolean = false;
  mostrarCrearUsuario: boolean = false;

  //   VARIABLES DE FILTROS  
  documentoBusqueda: string = '';
  filtroRol: string = '';
  filtroEstado: string = '';

  //   VARIABLES DE PAGINACIÓN  
  paginaActual: number = 1;
  perPage: number = 10;
  totalUsuarios: number = 0;
  totalPaginas: number = 0;

  //   VARIABLES DE SESIÓN  
  rolUsuario: string = '';

  //   CONSTRUCTOR  
  constructor(
    private usuarioGestorService: UsuarioGestorService,
    private router: Router,
    private cdr: ChangeDetectorRef // <-- LÍNEA NUEVA
  ) {
    this.rolUsuario = localStorage.getItem('usuario_rol') || '';
  }

  //   CICLO DE VIDA  
  ngOnInit(): void {
    if (this.rolUsuario !== 'Gerente') {
      this.router.navigate(['/home', this.rolUsuario]);
      return;
    }

    this.inicializarComponente();
  }

  //   MÉTODO DE INICIALIZACIÓN  
  
  inicializarComponente(): void {
    this.cargando = true;

    Promise.all([
      this.cargarEstados(),
      this.cargarRoles(),
      this.cargarEstadosReserva()
    ]).then(() => {
      this.cargarUsuarios();
    }).catch((error) => {
      console.error('Error en inicialización:', error);
      this.cargando = false;
    });
  }

  //   MÉTODOS DE CARGA DE DATOS  

cargarUsuarios(): void {
    const filtros = {
      rol: this.filtroRol,
      estado: this.filtroEstado,
      documento: this.documentoBusqueda
    };

    this.usuarioGestorService.getUsuarios(this.paginaActual, this.perPage, filtros)
      .then((response: any) => {
        if (response.status === 'success') {
          this.usuarios = response.data || [];
          this.totalUsuarios = response.total || 0;
          this.totalPaginas = response.last_page || 0;
        } else {
          this.usuarios = [];
          this.totalUsuarios = 0;
          this.totalPaginas = 0;
        }
        this.cargando = false;
        
        this.cdr.detectChanges(); // <-- LÍNEA NUEVA
      })
      .catch((error: any) => {
        console.error('Error cargando usuarios:', error);
        this.usuarios = [];
        this.totalUsuarios = 0;
        this.totalPaginas = 0;
        this.cargando = false;
        
        this.cdr.detectChanges(); // <-- LÍNEA NUEVA
      });
  }

  cargarEstados(): Promise<void> {
  return new Promise((resolve) => {
    this.usuarioGestorService.getEstados()
      .then((response: any) => {
        if (response.status === 'success') {
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

cargarRoles(): Promise<void> {
  return new Promise((resolve) => {
    this.usuarioGestorService.getRoles()
      .then((response: any) => {
        if (response.status === 'success') {
          this.roles = response.data || [];
        }
        resolve();
      })
      .catch((error: any) => {
        console.error('Error cargando roles:', error);
        this.roles = [];
        resolve();
      });
  });
}

cargarEstadosReserva(): Promise<void> {
  return Promise.resolve();
}

  //   MÉTODOS DE FILTROS  

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarUsuarios();
  }

  limpiarFiltros(): void {
    this.documentoBusqueda = '';
    this.filtroRol = '';
    this.filtroEstado = '';
    this.paginaActual = 1;
    this.cargarUsuarios();
  }

  //   MÉTODOS DE PAGINACIÓN  

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarUsuarios();
    }
  }

  cambiarPerPage(nuevaPerPage: number): void {
    this.perPage = nuevaPerPage;
    this.paginaActual = 1;
    this.cargarUsuarios();
  }

  //   MÉTODOS DE MODAL DETALLE  

  abrirDetalleUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarDetalleUsuario = true;
  }

  cerrarDetalleUsuario(): void {
    this.mostrarDetalleUsuario = false;
    this.usuarioSeleccionado = null;
    this.cargarUsuarios();
  }

  //   MÉTODOS DE MODAL HISTORIAL  

  abrirHistorialReservas(): void {
    this.mostrarHistorialReservas = true;
    this.mostrarDetalleUsuario = false;
  }

  cerrarHistorialReservas(): void {
    this.mostrarHistorialReservas = false;
  }

  //   MÉTODOS DE MODAL CREAR USUARIO  

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
    this.cargarUsuarios();
  }

  //   MÉTODOS DE ELIMINAR USUARIO  

  //  MÉTODOS DE BLOQUEAR USUARIO  

  bloquearUsuario(documento: string): void {
    if (confirm('¿Estás seguro de que deseas bloquear a este usuario?')) {
      // Llamamos al servicio para actualizar solo el estado a 3 (Bloqueado)
      this.usuarioGestorService.actualizarUsuario(documento, {
        cod_estado_usuario: 3 
      })
      .then((response: any) => {
        if (response.status === 'success') {
          alert('Usuario bloqueado exitosamente');
          // Recargamos la tabla (que ahora ya tiene el ChangeDetectorRef que arreglamos antes)
          this.cargarUsuarios(); 
        }
      })
      .catch((error: any) => {
        console.error('Error bloqueando usuario:', error);
        alert('Error al bloquear usuario');
      });
    }
  }

  //   MÉTODOS AUXILIARES  

  obtenerNombreEstado(codEstado: number): string {
    const estado = this.estados.find(e => e.cod_estado_usuario === codEstado);
    return estado ? estado.estado : 'N/A';
  }

  obtenerNombreRol(codRol: number): string {
    const rol = this.roles.find(r => r.cod_rol === codRol);
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
}