import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { DetalleElementoComponent } from '../detalle-elemento/detalle-elemento';
import { CrearElementoComponent } from '../crear-elemento/crear-elemento';
import { MantenimientoModalComponent } from '../mantenimiento-modal/mantenimiento-modal';
import { HistorialBajasComponent } from '../historial-bajas/historial-bajas';
import { PaginationHelper } from '../../../shared/utils/pagination.helper';

@Component({
  selector: 'app-lista-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleElementoComponent, CrearElementoComponent, MantenimientoModalComponent, HistorialBajasComponent],
  templateUrl: './lista-inventario.html',
  styleUrls: ['./lista-inventario.css']
})
export class ListaInventarioComponent extends PaginationHelper implements OnInit {
  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  tipoTab: 'activos' | 'accesorios' = 'activos';
  elementos: any[] = [];
  accesorios: any[] = [];
  
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  // Filtros Específicos
  filtroTipo = '';
  filtroEstado = '';
  filtroUbicacion = '';
  
  tipos: any[] = [];
  estados: any[] = [];
  ubicaciones: any[] = [];

  // Modales Principales
  mostrarCrear = false;
  mostrarDetalles = false;
  mostrarMantenimiento = false;
  elementoSeleccionado: any = null;

  // Modales de bajas de accesorios
  mostrarModalBajaAccesorio = false;
  accesorioSeleccionadoBaja: any = null;
  stockSeleccionadoBaja: any = null;
  cantidadBaja = 1;
  motivoBajaAccesorio = '';

  // Modales de bajas de equipos / activos fijos
  mostrarModalBajaEquipo = false;
  equipoSeleccionadoBaja: any = null;
  motivoBajaEquipo = '';

  // Modal de Traslados de Stock
  mostrarModalTraslado = false;
  accesorioSeleccionadoTraslado: any = null;
  stockSeleccionadoTraslado: any = null;
  cantidadTraslado = 1;
  ubicacionDestinoTraslado = '';

  // Control para el componente Historial de Bajas
  mostrarModalHistorialBajas = false;
  procesandoPeticion = false;

  constructor() {
    super(); // Requerido al heredar
  }

  ngOnInit(): void {
    this.inicializarComponente();
  }

  inicializarComponente(): void {
    this.cargando = true;
    this.inventarioService.obtenerOpciones().subscribe({
      next: (response: any) => {
        if (response) {
          const data = response.success !== undefined ? response : response;
          this.tipos = data.tipos || [];
          this.estados = data.estados || [];
          this.ubicaciones = data.ubicaciones || [];
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
    this.limpiarFiltrosLocal(); // Limpia y carga
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
        this.mensaje = 'Error al cargar los activos fijos';
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
        this.mensaje = 'Error al cargar los accesorios';
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

  // --- MÉTODOS DE MODALES Y ACCIONES (Se mantienen iguales) ---
  
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
        error: (err: any) => {
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
  
  cerrarDetalles(): void { this.mostrarDetalles = false; this.elementoSeleccionado = null; this.cargarDatos(); }
  
  abrirMantenimiento(elemento: any): void { this.elementoSeleccionado = elemento; this.mostrarMantenimiento = true; }
  cerrarMantenimiento(): void { this.mostrarMantenimiento = false; this.elementoSeleccionado = null; this.cargarDatos(); }

  // --- MÉTODOS PARA DAR DE BAJA ACTIVOS FIJOS (EQUIPOS) ---
  abrirModalDarDeBajaElemento(elemento: any): void {
    this.equipoSeleccionadoBaja = elemento;
    this.motivoBajaEquipo = '';
    this.mensaje = '';
    this.mostrarModalBajaEquipo = true;
    this.cdr.detectChanges();
  }

  cerrarModalBajaEquipo(): void {
    this.mostrarModalBajaEquipo = false;
    this.equipoSeleccionadoBaja = null;
    this.motivoBajaEquipo = '';
    this.mensaje = '';
  }

  procesarDarDeBajaElemento(): void {
    if (!this.motivoBajaEquipo || this.motivoBajaEquipo.trim() === '') {
      this.mensaje = 'Por favor, ingrese el motivo de la baja';
      this.tipoMensaje = 'error';
      return;
    }
    this.procesandoPeticion = true;
    this.inventarioService.darDeBajaElemento(this.equipoSeleccionadoBaja.id_elemento, { motivo: this.motivoBajaEquipo }).subscribe({
      next: (res: any) => {
        this.mensaje = res?.mensaje || 'Elemento dado de baja exitosamente';
        this.tipoMensaje = 'success';
        this.procesandoPeticion = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cerrarModalBajaEquipo();
          this.cargarDatos();
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err: any) => {
        this.mensaje = err.error?.mensaje || 'Error al dar de baja el elemento';
        this.tipoMensaje = 'error';
        this.procesandoPeticion = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- MÉTODOS PARA DAR DE BAJA ACCESORIOS ---
  abrirModalDarDeBajaAccesorio(acc: any, stock: any): void {
    this.accesorioSeleccionadoBaja = acc;
    this.stockSeleccionadoBaja = stock;
    this.cantidadBaja = 1;
    this.motivoBajaAccesorio = '';
    this.mensaje = '';
    this.mostrarModalBajaAccesorio = true;
    this.cdr.detectChanges();
  }

  cerrarModalBajaAccesorio(): void {
    this.mostrarModalBajaAccesorio = false;
    this.accesorioSeleccionadoBaja = null;
    this.stockSeleccionadoBaja = null;
    this.motivoBajaAccesorio = '';
    this.mensaje = '';
  }

  procesarDarDeBajaAccesorio(): void {
    if (this.cantidadBaja <= 0 || this.cantidadBaja > this.stockSeleccionadoBaja.cantidad_disponible) {
      this.mensaje = 'No puedes dar de baja más elementos de los que hay disponibles';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.motivoBajaAccesorio || this.motivoBajaAccesorio.trim() === '') {
      this.mensaje = 'Por favor, ingrese el motivo de la baja';
      this.tipoMensaje = 'error';
      return;
    }
    this.procesandoPeticion = true;
    this.inventarioService.darDeBajaAccesorio(this.stockSeleccionadoBaja.id_stock, { cantidad: this.cantidadBaja, motivo: this.motivoBajaAccesorio }).subscribe({
      next: (res: any) => {
        this.mensaje = res.mensaje || 'Unidades dadas de baja exitosamente';
        this.tipoMensaje = 'success';
        this.procesandoPeticion = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cerrarModalBajaAccesorio();
          this.cargarDatos();
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err: any) => {
        this.mensaje = err.error?.mensaje || 'Error al procesar la baja';
        this.tipoMensaje = 'error';
        this.procesandoPeticion = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- MÉTODOS PARA TRASLADAR STOCK ---
  abrirModalTraslado(acc: any, stock: any): void {
    this.accesorioSeleccionadoTraslado = acc;
    this.stockSeleccionadoTraslado = stock;
    this.cantidadTraslado = 1;
    this.ubicacionDestinoTraslado = '';
    this.mensaje = '';
    this.mostrarModalTraslado = true;
    this.cdr.detectChanges();
  }

  cerrarModalTraslado(): void {
    this.mostrarModalTraslado = false;
    this.accesorioSeleccionadoTraslado = null;
    this.stockSeleccionadoTraslado = null;
    this.mensaje = '';
  }

  procesarTraslado(): void {
    if (this.cantidadTraslado <= 0 || this.cantidadTraslado > this.stockSeleccionadoTraslado.cantidad_disponible) {
      this.mensaje = 'Cantidad inválida para trasladar';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.ubicacionDestinoTraslado || this.ubicacionDestinoTraslado == this.stockSeleccionadoTraslado.cod_ubi_elemento) {
      this.mensaje = 'Seleccione una ubicación de destino válida y diferente a la actual';
      this.tipoMensaje = 'error';
      return;
    }
    this.procesandoPeticion = true;
    this.inventarioService.trasladarStock({
      id_stock_origen: this.stockSeleccionadoTraslado.id_stock,
      cod_ubi_destino: Number(this.ubicacionDestinoTraslado),
      cantidad: this.cantidadTraslado
    }).subscribe({
      next: (res: any) => {
        this.mensaje = res.mensaje || 'Stock trasladado exitosamente';
        this.tipoMensaje = 'success';
        this.procesandoPeticion = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cerrarModalTraslado();
          this.cargarDatos();
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err: any) => {
        this.mensaje = err.error?.mensaje || 'Error al trasladar el stock';
        this.tipoMensaje = 'error';
        this.procesandoPeticion = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalBajasHistorial(): void { this.mostrarModalHistorialBajas = true; }
  cerrarModalBajasHistorial(): void { this.mostrarModalHistorialBajas = false; }

  // --- HELPERS VISUALES ---
  obtenerNombreTipo(cod: number): string { return this.tipos.find(t => t.cod_tipo_elemento == cod)?.tipo || 'N/A'; }
  obtenerNombreEstado(cod: number): string { return this.estados.find(e => e.cod_estado_elemento == cod)?.estado || 'N/A'; }
  
  obtenerClaseEstado(cod: number): string {
    const estadoMap: { [key: number]: string } = {
      1: 'estado-activo', 2: 'estado-inactivo', 3: 'estado-danado', 4: 'estado-pendiente'
    };
    return estadoMap[cod] || 'estado-inactivo';
  }
  
  obtenerNombreUbicacion(cod: number): string { return this.ubicaciones.find(u => u.cod_ubi_elemento == cod)?.ubicacion || 'N/A'; }
}