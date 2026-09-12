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

  elementos: any[] = [];
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  // Filtros
  busqueda = '';
  filtroTipo = '';
  filtroEstado = '';
  filtroUbicacion = '';

  // Paginación (ajustado al modelo de Gestión de Usuarios)
  paginaActual = 1;
  perPage = 10;
  totalPaginas = 1;
  totalElementos = 0;

  // Opciones para filtros
  tipos: any[] = [];
  estados: any[] = [];
  ubicaciones: any[] = [];

  // Modales
  mostrarCrear = false;
  mostrarDetalles = false;
  mostrarMantenimiento = false;
  elementoSeleccionado: any = null;

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
        this.cargarElementos();
      },
      error: (err: any) => {
        console.error('Error al cargar opciones:', err);
        this.cargarElementos();
      }
    });
  }

  cargarElementos(): void {
    this.cargando = true;
    this.mensaje = '';

    this.inventarioService.obtenerElementos(
      this.paginaActual,
      this.perPage, // <-- PASAR LA VARIABLE AQUÍ
      this.busqueda,
      this.filtroTipo,
      this.filtroEstado,
      this.filtroUbicacion
    ).subscribe({
      next: (response: any) => {
        // ... (el resto del código queda igual)
        if (response) {
          if (response.success !== undefined) {
            if (response.success) {
              this.elementos = response.data || [];
              this.totalElementos = response.total || 0;
              this.totalPaginas = response.last_page || 1;
            }
          } else {
            this.elementos = response.data || response;
            this.totalElementos = response.total || (Array.isArray(this.elementos) ? this.elementos.length : 0);
            this.totalPaginas = response.last_page || 1;
          }
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar elementos:', err);
        this.mensaje = 'Error al cargar los elementos';
        this.tipoMensaje = 'error';
        this.elementos = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscar(): void {
    this.paginaActual = 1;
    this.cargarElementos();
  }

  filtrar(): void {
    this.paginaActual = 1;
    this.cargarElementos();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.filtroUbicacion = '';
    this.paginaActual = 1;
    this.cargarElementos();
  }

  cambiarPerPage(nuevoPerPage: number): void {
    this.perPage = nuevoPerPage;
    this.paginaActual = 1;
    this.cargarElementos();
  }

  // MODALES
  abrirCrear(): void {
    this.mostrarCrear = true;
  }

  cerrarCrear(): void {
    this.mostrarCrear = false;
    this.cargarElementos();
  }

verDetalles(elemento: any): void {
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
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.elementoSeleccionado = null;
    this.cargarElementos();
  }

  abrirMantenimiento(elemento: any): void {
    this.elementoSeleccionado = elemento;
    this.mostrarMantenimiento = true;
  }

  cerrarMantenimiento(): void {
    this.mostrarMantenimiento = false;
    this.elementoSeleccionado = null;
    this.cargarElementos();
  }

  eliminarElemento(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
      return;
    }
    this.inventarioService.eliminarElemento(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.mensaje = 'Elemento eliminado exitosamente';
          this.tipoMensaje = 'success';
          this.cargarElementos();
        }
      },
      error: (err: any) => {
        console.error('Error al eliminar:', err);
        this.mensaje = 'Error al eliminar el elemento';
        this.tipoMensaje = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  // PAGINACIÓN
  irPaginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarElementos();
    }
  }

  irPaginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarElementos();
    }
  }

  obtenerNombreTipo(cod: number): string {
    const tipo = this.tipos.find(t => t.cod_tipo_elemento == cod);
    return tipo ? tipo.tipo : 'N/A';
  }

  obtenerNombreEstado(cod: number): string {
    const estado = this.estados.find(e => e.cod_estado_elemento == cod);
    return estado ? estado.estado : 'N/A';
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
    const ubicacion = this.ubicaciones.find(u => u.cod_ubi_elemento == cod);
    return ubicacion ? ubicacion.ubicacion : 'N/A';
  }
}