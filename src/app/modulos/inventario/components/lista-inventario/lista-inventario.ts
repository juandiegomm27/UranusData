import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { DetalleElementoComponent } from '../detalle-elemento/detalle-elemento';
import { CrearElementoComponent } from '../crear-elemento/crear-elemento';
import { MantenimientoModalComponent } from '../mantenimiento-modal/mantenimiento-modal';
import { HistorialBajasComponent } from '../historial-bajas/historial-bajas';
import { BajaActivoModalComponent } from '../baja-activo-modal/baja-activo-modal';
import { BajaAccesorioModalComponent } from '../baja-accesorio-modal/baja-accesorio-modal';
import { TrasladoStockModalComponent } from '../traslado-stock-modal/traslado-stock-modal';
import { PaginationHelper } from '../../../shared/utils/pagination.helper';
import { ESTADO_ELEMENTO, claseEstadoElemento } from '../../inventario.constants';

@Component({
  selector: 'app-lista-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DetalleElementoComponent,
    CrearElementoComponent,
    MantenimientoModalComponent,
    HistorialBajasComponent,
    BajaActivoModalComponent,
    BajaAccesorioModalComponent,
    TrasladoStockModalComponent
  ],
  templateUrl: './lista-inventario.html',
  styleUrls: ['./lista-inventario.css']
})
export class ListaInventarioComponent extends PaginationHelper implements OnInit {
  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  // Expuesto para usarlo en la plantilla
  readonly ESTADO = ESTADO_ELEMENTO;

  tipoTab: 'activos' | 'accesorios' = 'activos';
  elementos: any[] = [];
  accesorios: any[] = [];

  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  // Filtros específicos (terminoBusqueda se hereda del helper)
  filtroTipo = '';
  filtroEstado = '';
  filtroUbicacion = '';

  tipos: any[] = [];
  estados: any[] = [];
  ubicaciones: any[] = [];

  // Modales (solo uno a la vez)
  mostrarCrear = false;
  mostrarDetalles = false;
  mostrarMantenimiento = false;
  mostrarBajaEquipo = false;
  mostrarBajaAccesorio = false;
  mostrarTraslado = false;
  mostrarHistorialBajas = false;

  // Selección compartida por los modales
  elementoSeleccionado: any = null;   // equipos (detalle, mantenimiento, baja)
  accesorioSeleccionado: any = null;  // accesorios (baja, traslado)
  stockSeleccionado: any = null;

  ngOnInit(): void {
    this.inicializarComponente();
  }

  inicializarComponente(): void {
    this.cargando = true;
    this.inventarioService.obtenerOpciones().subscribe({
      next: (response: any) => {
        if (response) {
          this.tipos = response.tipos || [];
          this.estados = response.estados || [];
          this.ubicaciones = response.ubicaciones || [];
        }
        this.cargarDatos();
      },
      error: (err: any) => {
        console.error('Error al cargar opciones:', err);
        this.cargarDatos();
      }
    });
  }

  cambiarTab(tab: 'activos' | 'accesorios'): void {
    this.tipoTab = tab;
    this.limpiarFiltrosLocal();
  }

  // IMPLEMENTACIÓN OBLIGATORIA DEL HELPER
  cargarDatos(): void {
    if (this.tipoTab === 'activos') {
      this.cargarElementos();
    } else {
      this.cargarAccesorios();
    }
  }

  cargarElementos(): void {
    this.cargando = true;
    this.mensaje = '';
    this.inventarioService.obtenerElementos(
      this.paginaActual,
      this.perPage,
      this.terminoBusqueda,
      this.filtroTipo,
      this.filtroEstado,
      this.filtroUbicacion
    ).subscribe({
      next: (response: any) => {
        this.elementos = response.data || [];
        this.totalElementos = response.total || 0;
        this.totalPaginas = response.last_page || 1;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar elementos:', err);
        this.mensaje = 'Error al cargar los equipos';
        this.tipoMensaje = 'error';
        this.elementos = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarAccesorios(): void {
    this.cargando = true;
    this.mensaje = '';
    this.inventarioService.obtenerAccesorios(
      this.paginaActual,
      this.perPage,
      this.terminoBusqueda,
      this.filtroTipo,
      this.filtroUbicacion
    ).subscribe({
      next: (response: any) => {
        this.accesorios = response.data || [];
        this.totalElementos = response.total || 0;
        this.totalPaginas = response.last_page || 1;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar accesorios:', err);
        this.mensaje = 'Error al cargar los repuestos y consumibles';
        this.tipoMensaje = 'error';
        this.accesorios = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFiltrosLocal(): void {
    super.limpiarFiltrosBase();
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.filtroUbicacion = '';
    this.cargarDatos();
  }

  // --- CREAR / DETALLES / MANTENIMIENTO ---
  abrirCrear(): void { this.mostrarCrear = true; }
  cerrarCrear(): void { this.mostrarCrear = false; this.cargarDatos(); }

  verDetalles(elemento: any): void {
    if (this.tipoTab === 'activos') {
      this.inventarioService.obtenerElemento(elemento.id_elemento).subscribe({
        next: (response: any) => {
          this.elementoSeleccionado = response?.data || response;
          this.mostrarDetalles = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.elementoSeleccionado = elemento;
          this.mostrarDetalles = true;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.elementoSeleccionado = { ...elemento };
      this.mostrarDetalles = true;
      this.cdr.detectChanges();
    }
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.elementoSeleccionado = null;
    this.cargarDatos();
  }

  abrirMantenimiento(elemento: any): void {
    this.elementoSeleccionado = elemento;
    this.mostrarMantenimiento = true;
  }

  cerrarMantenimiento(): void {
    this.mostrarMantenimiento = false;
    this.elementoSeleccionado = null;
    this.cargarDatos();
  }

  // --- BAJA DE EQUIPOS ---
  abrirBajaEquipo(elemento: any): void {
    this.elementoSeleccionado = elemento;
    this.mostrarBajaEquipo = true;
  }

  cerrarBajaEquipo(recargar: boolean = false): void {
    this.mostrarBajaEquipo = false;
    this.elementoSeleccionado = null;
    if (recargar) this.cargarDatos();
  }

  // --- BAJA DE ACCESORIOS ---
  abrirBajaAccesorio(accesorio: any, stock: any): void {
    this.accesorioSeleccionado = accesorio;
    this.stockSeleccionado = stock;
    this.mostrarBajaAccesorio = true;
  }

  cerrarBajaAccesorio(recargar: boolean = false): void {
    this.mostrarBajaAccesorio = false;
    this.accesorioSeleccionado = null;
    this.stockSeleccionado = null;
    if (recargar) this.cargarDatos();
  }

  // --- TRASLADO DE STOCK ---
  abrirTraslado(accesorio: any, stock: any): void {
    this.accesorioSeleccionado = accesorio;
    this.stockSeleccionado = stock;
    this.mostrarTraslado = true;
  }

  cerrarTraslado(recargar: boolean = false): void {
    this.mostrarTraslado = false;
    this.accesorioSeleccionado = null;
    this.stockSeleccionado = null;
    if (recargar) this.cargarDatos();
  }

  // --- HISTORIAL DE BAJAS ---
  abrirHistorialBajas(): void { this.mostrarHistorialBajas = true; }
  cerrarHistorialBajas(): void { this.mostrarHistorialBajas = false; }

  // --- HELPERS VISUALES ---
  obtenerNombreTipo(cod: number): string { return this.tipos.find(t => t.cod_tipo_elemento == cod)?.tipo || 'N/A'; }
  obtenerNombreEstado(cod: number): string { return this.estados.find(e => e.cod_estado_elemento == cod)?.estado || 'N/A'; }
  obtenerClaseEstado(cod: number): string { return claseEstadoElemento(cod); }
  obtenerNombreUbicacion(cod: number): string { return this.ubicaciones.find(u => u.cod_ubi_elemento == cod)?.ubicacion || 'N/A'; }
}