import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamosActivosService, PrestamoActivo } from '../../services/prestamos-activos.service';

@Component({
  selector: 'app-lista-prestamos-activos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-prestamos-activos.html',
  styleUrls: ['./lista-prestamos-activos.css']
})
export class ListaPrestamosActivosComponent implements OnInit {
  // Datos
  prestamos: PrestamoActivo[] = [];
  
  // Estados
  cargando = false;
  sinDatos = false;
  
  // Paginación
  paginaActual = 1;
  registrosPorPagina = 10;
  totalRegistros = 0;
  ultimaPagina = 1;
  desde = 0;
  hasta = 0;

  // Búsqueda y Filtros
  busqueda = '';
  estadoSeleccionado: number | null = null;
  tipoSeleccionado: number | null = null;

  // Catálogos
  estados = [
    { cod: 1, nombre: 'Solicitado' },
    { cod: 2, nombre: 'Entregado' },
    { cod: 3, nombre: 'Devuelto' },
    { cod: 4, nombre: 'Perdido' },
    { cod: 5, nombre: 'Dañado' }
  ];

  tipos = [
    { cod: 1, nombre: 'Computador' },
    { cod: 2, nombre: 'Monitor' },
    { cod: 3, nombre: 'Proyector' },
    { cod: 4, nombre: 'Accesorio' },
    { cod: 5, nombre: 'Impresora' },
    { cod: 6, nombre: 'Router' },
    { cod: 7, nombre: 'Servidor' },
    { cod: 8, nombre: 'Webcam' }
  ];

  constructor(
    private prestamosService: PrestamosActivosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPrestamos();
  }

  /**
   * Cargar préstamos activos
   */
  cargarPrestamos(): void {
    this.cargando = true;
    this.sinDatos = false;

    this.prestamosService
      .obtenerPrestamosActivos(
        this.paginaActual,
        this.registrosPorPagina,
        this.busqueda,
        this.estadoSeleccionado,
        this.tipoSeleccionado
      )
      .subscribe({
        next: (response) => {
          this.prestamos = response.data;
          this.totalRegistros = response.pagination.total;
          this.ultimaPagina = response.pagination.last_page;
          this.desde = response.pagination.from;
          this.hasta = response.pagination.to;

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

  /**
   * Buscar préstamos
   */
  buscar(): void {
    this.paginaActual = 1;
    this.cargarPrestamos();
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.busqueda = '';
    this.estadoSeleccionado = null;
    this.tipoSeleccionado = null;
    this.paginaActual = 1;
    this.cargarPrestamos();
  }

  /**
   * Ir a página anterior
   */
  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarPrestamos();
    }
  }

  /**
   * Ir a página siguiente
   */
  paginaSiguiente(): void {
    if (this.paginaActual < this.ultimaPagina) {
      this.paginaActual++;
      this.cargarPrestamos();
    }
  }

  /**
   * Obtener nombre del estado
   */
  obtenerNombreEstado(cod: number): string {
    const estado = this.estados.find(e => e.cod === cod);
    return estado ? estado.nombre : 'Desconocido';
  }

  /**
   * Obtener clase CSS del estado
   */
  obtenerClaseEstado(cod: number): string {
    const clases: { [key: number]: string } = {
      1: 'estado-solicitado',
      2: 'estado-entregado',
      3: 'estado-devuelto',
      4: 'estado-perdido',
      5: 'estado-danado'
    };
    return clases[cod] || '';
  }

  /**
   * Entregar préstamo (actualizar estado)
   */
  entregarPrestamo(prestamo: PrestamoActivo): void {
    if (confirm(`¿Confirmar entrega del préstamo ${prestamo.id_reserva}?`)) {
      console.log('Entregar préstamo:', prestamo);
      // Aquí iría la lógica de actualización
    }
  }

  /**
   * Ver detalles del préstamo
   */
  verDetalles(prestamo: PrestamoActivo): void {
    console.log('Ver detalles de:', prestamo);
    // Abrir modal con detalles
  }
}