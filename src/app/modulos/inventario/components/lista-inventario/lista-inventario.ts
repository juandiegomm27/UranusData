import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
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
import { ESTADO_ELEMENTO, claseEstadoElemento } from '../../services/inventario.constants';

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

  // Bloquea el botón de Excel mientras el backend arma el archivo
  exportando = false;

  // Filtros específicos (terminoBusqueda se hereda del helper)
  filtroTipo = '';
  filtroMarca = '';
  filtroEstado = '';
  filtroUbicacion = '';

  tipos: any[] = [];
  marcas: any[] = [];
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
    this.recargarOpciones();
  }

  // Recarga catálogos (tipos, marcas, estados, ubicaciones) y la tabla
  recargarOpciones(): void {
    this.inventarioService.obtenerOpciones().subscribe({
      next: (response: any) => {
        if (response) {
          this.tipos = response.tipos || [];
          this.marcas = response.marcas || [];
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

  /**
   * Descarga el inventario en Excel.
   *
   * Manda la pestaña activa y los mismos filtros de la tabla, así que el
   * archivo trae lo que se está viendo. Lo que no manda es la página: el
   * Excel sale completo, no solo las 10 filas en pantalla.
   */
  exportarExcel(): void {
    if (this.exportando) { return; }
    this.exportando = true;
    this.mensaje = '';

    this.inventarioService.exportarExcel(
      this.tipoTab,
      this.terminoBusqueda,
      this.filtroTipo,
      this.filtroMarca,
      this.filtroUbicacion,
      this.filtroEstado
    ).subscribe({
      next: (respuesta) => {
        const cuerpo = respuesta.body;
        if (!cuerpo) {
          this.fallaExportacion('El servidor devolvió un archivo vacío.');
          return;
        }
        this.descargar(cuerpo, this.nombreArchivo(respuesta));
        this.exportando = false;
        this.tipoMensaje = 'success';
        this.mensaje = 'Archivo de Excel descargado.';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al exportar a Excel:', err);
        this.fallaExportacion('No se pudo generar el archivo de Excel.');
      }
    });
  }

  private fallaExportacion(texto: string): void {
    this.exportando = false;
    this.tipoMensaje = 'error';
    this.mensaje = texto;
    this.cdr.detectChanges();
  }

  /** El nombre lo decide el backend; si no llega, uno de respaldo. */
  private nombreArchivo(respuesta: HttpResponse<Blob>): string {
    const cabecera = respuesta.headers.get('Content-Disposition');
    const encontrado = cabecera?.match(/filename="?([^";]+)"?/i);
    if (encontrado) { return encontrado[1]; }
    const hoy = new Date().toISOString().slice(0, 10);
    return `inventario-${this.tipoTab}-${hoy}.xlsx`;
  }

  /**
   * Un blob no se puede "abrir" sin más: hay que darle una URL temporal al
   * navegador, pinchar un enlace invisible y soltar la URL después, o la
   * memoria del archivo se queda retenida en la pestaña.
   */
  private descargar(contenido: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(contenido);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    window.URL.revokeObjectURL(url);
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
      this.filtroUbicacion,
      false,
      this.filtroMarca
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
      this.filtroUbicacion,
      this.filtroMarca
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
    this.filtroMarca = '';
    this.filtroEstado = '';
    this.filtroUbicacion = '';
    this.cargarDatos();
  }

  // --- CREAR / DETALLES / MANTENIMIENTO ---
  abrirCrear(): void { this.mostrarCrear = true; }
  cerrarCrear(): void { this.mostrarCrear = false; this.recargarOpciones(); }

  verDetalles(elemento: any): void {
    // Se abre de inmediato con los datos de la fila; el detalle completo lo carga el propio modal
    this.elementoSeleccionado = this.tipoTab === 'activos' ? elemento : { ...elemento };
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.elementoSeleccionado = null;
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