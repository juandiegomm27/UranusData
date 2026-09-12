import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { InventarioService } from '../../../Inventario/services/inventario.service';
import { DetalleMantenimientoComponent } from '../detalle-mantenimiento/detalle-mantenimiento';

@Component({
  selector: 'app-lista-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleMantenimientoComponent],
  templateUrl: './lista-mantenimiento.html',
  styleUrls: ['./lista-mantenimiento.css']
})
export class ListaMantenimientoComponent implements OnInit {
  mantenimientos: any[] = [];
  tiposMantenimiento: any[] = [];
  estadosMantenimiento: any[] = [];

  // Filtros y Paginación
  busqueda = '';
  filtroTipo = '';
  filtroEstado = '';
  filtroFecha = '';
  paginaActual = 1;
  perPage = 10;
  totalPaginas = 1;
  totalElementos = 0;

  // Modales
  mostrarDetalles = false;
  mantenimientoSeleccionado: any = null;
  mostrarCrear = false;
  cargandoModal = false;
  mensajeModal = '';
  tipoMensajeModal: 'success' | 'error' = 'success';

  // Buscador interactivo en el modal de creación
  equiposDisponibles: any[] = [];
  equiposFiltrados: any[] = [];
  busquedaEquipo = '';
  mostrarSugerencias = false;
  equipoSeleccionadoNombre = '';

  nuevoMant = {
    id_elemento: '',
    cod_tipo_mantenimiento: '',
    descripcion: ''
  };

  cargando = false;
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private mantenimientoService: MantenimientoService,
    private inventarioService: InventarioService 
  ) {}

  ngOnInit(): void {
    this.cargarOpciones();
    this.cargarMantenimientos();
  }

cargarOpciones(): void {
    this.mantenimientoService.obtenerOpciones().subscribe({
      next: (res: any) => {
        this.tiposMantenimiento = res?.tipos_mantenimiento || [];
        this.estadosMantenimiento = res?.estados_mantenimiento || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar opciones de mantenimiento:', err)
    });
  }

  cargarMantenimientos(): void {
    this.cargando = true;
    this.mantenimientoService.obtenerMantenimientos(
      this.paginaActual,
      this.perPage,
      this.busqueda,
      this.filtroEstado,
      this.filtroTipo,
      this.filtroFecha
    ).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.mantenimientos = Array.isArray(data) ? data : data?.data || [];
        this.totalElementos = res?.total || data?.total || this.mantenimientos.length;
        this.totalPaginas = res?.last_page || data?.last_page || 1;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar mantenimientos:', err);
        this.mantenimientos = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargarMantenimientos();
  }

  filtrar(): void {
    this.paginaActual = 1;
    this.cargarMantenimientos();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.filtroFecha = '';
    this.paginaActual = 1;
    this.cargarMantenimientos();
  }

  cambiarPerPage(nuevoPerPage: number): void {
    this.perPage = nuevoPerPage;
    this.paginaActual = 1;
    this.cargarMantenimientos();
  }

  // --- BUSCADOR INTERACTIVO DE EQUIPOS EN MODAL ---
  abrirCrear(): void {
    this.mostrarCrear = true;
    this.mensajeModal = '';
    this.busquedaEquipo = '';
    this.equipoSeleccionadoNombre = '';
    this.mostrarSugerencias = false;
    this.nuevoMant = { id_elemento: '', cod_tipo_mantenimiento: '', descripcion: '' };
    
    this.inventarioService.obtenerElementos(1, 500).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        const items = Array.isArray(data) ? data : data?.data || [];
        this.equiposDisponibles = items.filter((e: any) => e.cod_estado_elemento == 1);
        this.equiposFiltrados = [...this.equiposDisponibles];
        this.cdr.detectChanges();
      }
    });
  }

  filtrarEquipos(): void {
    const query = this.busquedaEquipo.toLowerCase().trim();
    if (!query) {
      this.equiposFiltrados = [...this.equiposDisponibles];
      this.mostrarSugerencias = false;
      return;
    }
    this.equiposFiltrados = this.equiposDisponibles.filter(e => 
      e.nombre_elemento?.toLowerCase().includes(query) ||
      e.id_elemento?.toString().includes(query) ||
      e.serial?.toLowerCase().includes(query)
    );
    this.mostrarSugerencias = true;
  }

  seleccionarEquipo(equipo: any): void {
    this.nuevoMant.id_elemento = equipo.id_elemento;
    this.busquedaEquipo = `${equipo.nombre_elemento} (ID: ${equipo.id_elemento})`;
    this.equipoSeleccionadoNombre = equipo.nombre_elemento;
    this.mostrarSugerencias = false;
  }

  cerrarCrear(): void {
    this.mostrarCrear = false;
    this.mensajeModal = '';
  }

  guardarNuevoMantenimiento(): void {
    if (!this.nuevoMant.id_elemento || !this.nuevoMant.cod_tipo_mantenimiento || !this.nuevoMant.descripcion.trim()) {
      this.mensajeModal = 'Por favor selecciona un equipo, el tipo y describe el problema.';
      this.tipoMensajeModal = 'error';
      return;
    }

    this.cargandoModal = true;
    
    const payload = {
      cod_tipo_mantenimiento: this.nuevoMant.cod_tipo_mantenimiento,
      descripcion: this.nuevoMant.descripcion.trim()
    };

    this.inventarioService.enviarMantenimiento(Number(this.nuevoMant.id_elemento), payload).subscribe({
      next: (res: any) => {
        if (res.success !== false) {
          this.mensajeModal = 'Reporte creado exitosamente.';
          this.tipoMensajeModal = 'success';
          setTimeout(() => {
            this.cerrarCrear();
            this.cargarMantenimientos();
          }, 1500);
        }
        this.cargandoModal = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al crear mantenimiento:', err);
        this.mensajeModal = err.error?.mensaje || 'Error al crear el reporte.';
        this.tipoMensajeModal = 'error';
        this.cargandoModal = false;
        this.cdr.detectChanges();
      }
    });
  }


  accionParaCompletar: number | null = null;

  verDetalles(mantenimiento: any): void {
    this.mantenimientoSeleccionado = mantenimiento;
    this.accionParaCompletar = null; 
    this.mostrarDetalles = true;
  }

  abrirYCompletar(mantenimiento: any): void {
    this.mantenimientoSeleccionado = mantenimiento;
    this.accionParaCompletar = 3; 
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.mantenimientoSeleccionado = null;
    this.cargarMantenimientos();
  }

  // --- PAGINACIÓN ---
  irPaginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarMantenimientos();
    }
  }

  irPaginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarMantenimientos();
    }
  }

  obtenerNombreTipo(cod: any): string {
    const tipo = this.tiposMantenimiento.find(t => t.cod_tipo_mantenimiento == cod);
    return tipo ? (tipo.tipo_mantenimiento || tipo.tipo || tipo.nombre) : 'Desconocido';
  }

  
}