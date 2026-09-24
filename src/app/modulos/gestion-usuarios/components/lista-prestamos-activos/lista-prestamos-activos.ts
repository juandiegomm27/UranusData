import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamosActivosService, PrestamoActivo } from '../../../prestamos/services/prestamos-activos.service';
import { ModalDetallesPrestamoComponent } from '../../../shared/components/modal-detalles-prestamo/modal-detalles-prestamo.component';
import { PaginationHelper } from '../../../shared/utils/pagination.helper';

@Component({
  selector: 'app-lista-prestamos-activos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalDetallesPrestamoComponent],
  templateUrl: './lista-prestamos-activos.html',
  styleUrls: ['./lista-prestamos-activos.css']
})
export class ListaPrestamosActivosComponent extends PaginationHelper implements OnInit {
  private prestamosService = inject(PrestamosActivosService);
  private cdr = inject(ChangeDetectorRef);

  prestamos: PrestamoActivo[] = [];
  sinDatos = false;
  mostrarModal = false;
  prestamoSeleccionado: PrestamoActivo | null = null;
  
  estadoSeleccionado: number | null = null;
  tipoSeleccionado: number | null = null;

  estados = [
    { cod: 1, nombre: 'Solicitado' }, { cod: 2, nombre: 'Entregado' },
    { cod: 3, nombre: 'Devuelto' }, { cod: 4, nombre: 'Perdido' }, { cod: 5, nombre: 'Dañado' }
  ];

  tipos = [
    { cod: 1, nombre: 'Computador' }, { cod: 2, nombre: 'Monitor' }, { cod: 3, nombre: 'Proyector' },
    { cod: 4, nombre: 'Accesorio' }, { cod: 5, nombre: 'Impresora' }, { cod: 6, nombre: 'Router' },
    { cod: 7, nombre: 'Servidor' }, { cod: 8, nombre: 'Webcam' }
  ];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.sinDatos = false;
    
    this.prestamosService
      .obtenerPrestamosActivos(
        this.paginaActual,
        this.perPage,
        this.terminoBusqueda,
        this.estadoSeleccionado,
        this.tipoSeleccionado
      )
      .subscribe({
        next: (response) => {
          this.prestamos = response.data || [];
          this.totalElementos = response.pagination.total;
          this.totalPaginas = response.pagination.last_page;
          
          if (this.prestamos.length === 0) {
            this.sinDatos = true;
          }
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error cargando préstamos:', error);
          this.cargando = false;
          this.sinDatos = true;
          this.cdr.detectChanges();
        }
      });
  }

  limpiarFiltros(): void {
    super.limpiarFiltrosBase();
    this.estadoSeleccionado = null;
    this.tipoSeleccionado = null;
    this.cargarDatos();
  }

  obtenerNombreEstado(cod: number): string {
    const estado = this.estados.find(e => e.cod === cod);
    return estado ? estado.nombre : 'Desconocido';
  }

  obtenerClaseEstado(cod: number): string {
    const clases: { [key: number]: string } = {
      1: 'estado-solicitado', 2: 'estado-entregado', 3: 'estado-devuelto',
      4: 'estado-perdido', 5: 'estado-danado'
    };
    return clases[cod] || '';
  }

  verDetalles(prestamo: PrestamoActivo): void {
    this.prestamoSeleccionado = prestamo;
    this.mostrarModal = true;
  }

  entregarPrestamo(prestamo: PrestamoActivo): void {
    this.prestamoSeleccionado = { ...prestamo };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.prestamoSeleccionado = null;
  }

  onActualizarPrestamo(): void {
    this.cargarDatos();
  }

  trackByIdReserva(index: number, prestamo: PrestamoActivo): number {
    return prestamo.id_reserva;
  }

  trackByEstadoElemento(index: number, estado: any): number {
    return estado.cod_estado_elemento;
  }
}