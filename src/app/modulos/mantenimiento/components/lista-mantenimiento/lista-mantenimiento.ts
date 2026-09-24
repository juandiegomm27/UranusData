import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { InventarioService } from '../../../inventario/services/inventario.service';
import { DetalleMantenimientoComponent } from '../detalle-mantenimiento/detalle-mantenimiento';
import { HistorialBajasComponent } from '../../../inventario/components/historial-bajas/historial-bajas';
import { PaginationHelper } from '../../../shared/utils/pagination.helper';

@Component({
  selector: 'app-lista-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleMantenimientoComponent, HistorialBajasComponent],
  templateUrl: './lista-mantenimiento.html',
  styleUrls: ['./lista-mantenimiento.css']
})
export class ListaMantenimientoComponent extends PaginationHelper implements OnInit {
  mantenimientos: any[] = [];
  tiposMantenimiento: any[] = [];
  estadosMantenimiento: any[] = [];

  // Filtros Específicos (terminoBusqueda se hereda del helper)
  filtroTipo = '';
  filtroEstado = '';
  filtroFecha = '';

  // Modales
  mostrarDetalles = false;
  mantenimientoSeleccionado: any = null;
  mostrarCrear = false;
  cargandoModal = false;
  mensajeModal = '';
  tipoMensajeModal: 'success' | 'error' = 'success';
  mostrarModalHistorialBajas = false;

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

  private cdr = inject(ChangeDetectorRef);
  accionParaCompletar: number | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private inventarioService: InventarioService
  ) {
    super();
  }

  ngOnInit(): void {
    this.cargarOpciones();
    this.cargarDatos();
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

  // IMPLEMENTACIÓN OBLIGATORIA DEL HELPER
  cargarDatos(): void {
    this.cargando = true;
    this.mantenimientoService.obtenerMantenimientos(
      this.paginaActual,
      this.perPage,
      this.terminoBusqueda,
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
        this.totalElementos = 0;
        this.totalPaginas = 1;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFiltrosLocal(): void {
    super.limpiarFiltrosBase(); // Limpia término de búsqueda y página
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.filtroFecha = '';
    this.cargarDatos();
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
            this.cargarDatos(); // Recargar la tabla usando el helper
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
    this.cargarDatos();
  }

  abrirModalBajasHistorial(): void {
    this.mostrarModalHistorialBajas = true;
  }

  cerrarModalBajasHistorial(): void {
    this.mostrarModalHistorialBajas = false;
  }

  obtenerNombreTipo(cod: any): string {
    const tipo = this.tiposMantenimiento.find(t => t.cod_tipo_mantenimiento == cod);
    return tipo ? (tipo.tipo_mantenimiento || tipo.tipo || tipo.nombre) : 'Desconocido';
  }
}