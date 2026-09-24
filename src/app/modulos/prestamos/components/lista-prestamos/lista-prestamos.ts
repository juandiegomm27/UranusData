import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamosActivosService, PrestamoActivo } from '../../services/prestamos-activos.service';
import { PaginationHelper } from '../../../shared/utils/pagination.helper';
import { ModalDetallesPrestamoComponent } from '../../../shared/components/modal-detalles-prestamo/modal-detalles-prestamo.component';

@Component({
  selector: 'app-lista-prestamos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalDetallesPrestamoComponent],
  templateUrl: './lista-prestamos.html',
  styleUrls: ['./lista-prestamos.css']
})
export class ListaPrestamosComponent extends PaginationHelper implements OnInit {
  prestamos: PrestamoActivo[] = [];
  mostrarModal = false;
  prestamoSeleccionado: PrestamoActivo | null = null;

  constructor(private prestamosService: PrestamosActivosService) {
    super();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // IMPLEMENTACIÓN OBLIGATORIA DEL HELPER
  cargarDatos(): void {
    this.cargando = true;
    this.prestamosService.obtenerPrestamos(this.paginaActual).subscribe({
      next: (response: any) => {
        if (response.success || response.data) {
          this.prestamos = response.data || response;
          this.totalElementos = response.total || this.prestamos.length;
          this.totalPaginas = response.last_page || 1;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar préstamos:', err);
        this.cargando = false;
      }
    });
  }

  abrirDetalles(prestamo: PrestamoActivo): void {
    this.prestamoSeleccionado = prestamo;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.prestamoSeleccionado = null;
    this.cargarDatos();
  }

  obtenerNombreEstado(cod: number): string {
    const estados: { [key: number]: string } = {
      1: 'Solicitado', 2: 'Entregado', 3: 'Devuelto', 4: 'Perdido', 5: 'Dañado'
    };
    return estados[cod] || 'Desconocido';
  }

  obtenerClaseEstado(cod: number): string {
    const clases: { [key: number]: string } = {
      1: 'solicitado', 2: 'entregado', 3: 'devuelto', 4: 'perdido', 5: 'danado'
    };
    return clases[cod] || '';
  }
}