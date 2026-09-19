import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { DetalleElementoComponent } from '../detalle-elemento/detalle-elemento';
import { CrearElementoComponent } from '../crear-elemento/crear-elemento';
import { MantenimientoModalComponent } from '../mantenimiento-modal/mantenimiento-modal';

@Component({
  selector: 'app-lista-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleElementoComponent, CrearElementoComponent, MantenimientoModalComponent],
  templateUrl: './lista-inventario.html',
  styleUrls: ['./lista-inventario.css']
})
export class ListaInventarioComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  tipoTab: 'activos' | 'accesorios' = 'activos';

  elementos: any[] = [];
  accesorios: any[] = [];
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  busqueda = '';
  filtroTipo = '';
  filtroEstado = '';
  filtroUbicacion = '';

  paginaActual = 1;
  perPage = 10;
  totalPaginas = 1;
  totalElementos = 0;

  tipos: any[] = [];
  estados: any[] = [];
  ubicaciones: any[] = [];

  mostrarCrear = false;
  mostrarDetalles = false;
  mostrarMantenimiento = false;
  elementoSeleccionado: any = null;

  // Modales de bajas de accesorios
  mostrarModalBajaAccesorio = false;
  accesorioSeleccionadoBaja: any = null;
  stockSeleccionadoBaja: any = null; // NUEVO: Identifica el lote exacto
  cantidadBaja = 1;
  motivoBajaAccesorio = '';

  // Modales de bajas de equipos / activos fijos
  mostrarModalBajaEquipo = false;
  equipoSeleccionadoBaja: any = null;
  motivoBajaEquipo = '';
  
  // NUEVO: Modal de Traslados de Stock
  mostrarModalTraslado = false;
  accesorioSeleccionadoTraslado: any = null;
  stockSeleccionadoTraslado: any = null;
  cantidadTraslado = 1;
  ubicacionDestinoTraslado = '';

  // Historial de bajas
  cargandoHistorial = false;
  mostrarModalHistorialBajas = false;
  historialBajas: any[] = [];
  totalUnidadesBaja = 0;
  procesandoPeticion = false;

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
        this.cargarDatosActuales();
      },
      error: (err: any) => {
        console.error('Error al cargar opciones:', err);
        this.cargarDatosActuales();
      }
    });
  }

  cambiarTab(tab: 'activos' | 'accesorios'): void {
    this.tipoTab = tab;
    this.paginaActual = 1;
    this.busqueda = '';
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.filtroUbicacion = '';
    this.cargarDatosActuales();
  }

  cargarDatosActuales(): void {
    if (this.tipoTab === 'activos') {
      this.cargarElementos();
    } else {
      this.cargarAccesorios();
    }
  }

  recargarDatos(): void {
    this.cargarDatosActuales();
  }

  cargarElementos(): void {
    this.cargando = true;
    this.mensaje = '';
    this.inventarioService.obtenerElementos(
      this.paginaActual,
      this.perPage,
      this.busqueda,
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
      this.busqueda,
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

  buscar(): void {
    this.paginaActual = 1;
    this.cargarDatosActuales();
  }

  filtrar(): void {
    this.paginaActual = 1;
    this.cargarDatosActuales();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.filtroUbicacion = '';
    this.paginaActual = 1;
    this.cargarDatosActuales();
  }

  cambiarPerPage(nuevoPerPage: number): void {
    this.perPage = nuevoPerPage;
    this.paginaActual = 1;
    this.cargarDatosActuales();
  }

  abrirCrear(): void {
    this.mostrarCrear = true;
  }

  cerrarCrear(): void {
    this.mostrarCrear = false;
    this.cargarDatosActuales();
  }

  verDetalles(elemento: any): void {
    if (this.tipoTab === 'activos') {
      this.inventarioService.obtenerElemento(elemento.id_elemento).subscribe({
        next: (response: any) => {
          this.elementoSeleccionado = response?.data || response;
          this.mostrarDetalles = true;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error al obtener detalles del elemento:', err);
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
    this.cargarDatosActuales();
  }

  abrirMantenimiento(elemento: any): void {
    this.elementoSeleccionado = elemento;
    this.mostrarMantenimiento = true;
  }

  cerrarMantenimiento(): void {
    this.mostrarMantenimiento = false;
    this.elementoSeleccionado = null;
    this.cargarDatosActuales();
  }

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
  }

  procesarDarDeBajaElemento(): void {
    if (!this.motivoBajaEquipo || this.motivoBajaEquipo.trim() === '') {
      this.mensaje = 'Por favor, ingrese el motivo de la baja';
      this.tipoMensaje = 'error';
      return;
    }
    this.procesandoPeticion = true; 

    this.inventarioService.darDeBajaElemento(this.equipoSeleccionadoBaja.id_elemento, {
      motivo: this.motivoBajaEquipo
    }).subscribe({
      next: (res: any) => {
        this.mensaje = res?.mensaje || 'Elemento dado de baja exitosamente';
        this.tipoMensaje = 'success';
        this.procesandoPeticion = false; 
        this.cerrarModalBajaEquipo();
        this.cargarDatosActuales();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensaje = err.error?.mensaje || 'Error al dar de baja el elemento';
        this.tipoMensaje = 'error';
        this.procesandoPeticion = false; 
        this.cdr.detectChanges();
      }
    });
  }

  // --- MÉTODOS PARA DAR DE BAJA ACCESORIOS (ACTUALIZADO PARA STOCK) ---
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

    // Pasamos el id_stock específico a dar de baja
    this.inventarioService.darDeBajaAccesorio(this.stockSeleccionadoBaja.id_stock, {
      cantidad: this.cantidadBaja,
      motivo: this.motivoBajaAccesorio
    }).subscribe({
      next: (res: any) => {
        this.mensaje = res.mensaje || 'Unidades dadas de baja exitosamente';
        this.tipoMensaje = 'success';
        this.procesandoPeticion = false;
        this.cerrarModalBajaAccesorio();
        this.cargarAccesorios();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensaje = err.error?.mensaje || 'Error al procesar la baja';
        this.tipoMensaje = 'error';
        this.procesandoPeticion = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- NUEVO: MÉTODOS PARA TRASLADAR STOCK ---
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
        this.cerrarModalTraslado();
        this.cargarAccesorios(); // Refrescamos la tabla
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensaje = err.error?.mensaje || 'Error al trasladar el stock';
        this.tipoMensaje = 'error';
        this.procesandoPeticion = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- HISTORIAL DE BAJAS ---
  abrirModalBajasHistorial(): void {
    this.cargandoHistorial = true;
    const tipoFiltro = this.tipoTab === 'activos' ? 'activo' : 'accesorio';

    this.inventarioService.obtenerHistorialBajasGeneral(tipoFiltro).subscribe({
      next: (res: any) => {
        const items = res?.data?.data || res?.data || [];
        this.historialBajas = items;
        this.totalUnidadesBaja = this.historialBajas.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
        this.mostrarModalHistorialBajas = true;
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar historial de bajas:', err);
        this.historialBajas = [];
        this.totalUnidadesBaja = 0;
        this.mostrarModalHistorialBajas = true;
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      }
    });
  }

  restaurarItem(baja: any): void {
    if (!confirm(`¿Estás seguro de que deseas restaurar "${baja.nombre}" de vuelta al inventario activo?`)) {
      return;
    }
    this.inventarioService.restaurarBaja(baja.id_baja).subscribe({
      next: (res: any) => {
        this.mensaje = res.mensaje || 'Elemento restaurado exitosamente';
        this.tipoMensaje = 'success';
        this.abrirModalBajasHistorial();
        this.cargarDatosActuales();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensaje = err.error?.mensaje || 'Error al restaurar el elemento';
        this.tipoMensaje = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalBajasHistorial(): void {
    this.mostrarModalHistorialBajas = false;
  }

  irPaginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarDatosActuales();
    }
  }

  irPaginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarDatosActuales();
    }
  }

  obtenerNombreTipo(cod: number): string {
    return this.tipos.find(t => t.cod_tipo_elemento == cod)?.tipo || 'N/A';
  }

  obtenerNombreEstado(cod: number): string {
    return this.estados.find(e => e.cod_estado_elemento == cod)?.estado || 'N/A';
  }

  obtenerClaseEstado(cod: number): string {
    const estadoMap: { [key: number]: string } = {
      1: 'estado-activo',
      2: 'estado-inactivo',
      3: 'estado-danado',
      4: 'estado-pendiente'
    };
    return estadoMap[cod] || 'estado-inactivo';
  }

  obtenerNombreUbicacion(cod: number): string {
    return this.ubicaciones.find(u => u.cod_ubi_elemento == cod)?.ubicacion || 'N/A';
  }
}