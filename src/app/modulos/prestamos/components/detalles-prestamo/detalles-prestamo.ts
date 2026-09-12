import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamoActivo, PrestamosActivosService } from '../../services/prestamos-activos.service';

@Component({
  selector: 'app-detalles-prestamo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalles-prestamo.html',
  styleUrls: ['./detalles-prestamo.css']
})
export class DetallesPrestamoComponent implements OnInit {
  @Input() prestamo: PrestamoActivo | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() actualizarPrestamo = new EventEmitter<void>();

  private prestamosService = inject(PrestamosActivosService);

  cargando = false;
  actualizando = false;
  nuevoEstado: number | null = null;
  observaciones = '';
  mensajeError = '';
  mensajeExito = '';

  estadosDisponibles = [
    { cod: 1, nombre: 'Solicitado' },
    { cod: 2, nombre: 'Entregado' },
    { cod: 3, nombre: 'Devuelto' },
    { cod: 4, nombre: 'Perdido' },
    { cod: 5, nombre: 'Dañado' }
  ];

  ngOnInit(): void {
    if (this.prestamo) {
      this.nuevoEstado = this.prestamo.cod_estado_prestamo;
    }
  }

  obtenerNombreEstado(cod: number): string {
    const estado = this.estadosDisponibles.find(e => e.cod === cod);
    return estado ? estado.nombre : 'Desconocido';
  }

  obtenerClaseEstado(cod: number): string {
    const clases: { [key: number]: string } = {
      1: 'solicitado',
      2: 'entregado',
      3: 'devuelto',
      4: 'perdido',
      5: 'danado'
    };
    return clases[cod] || '';
  }

  guardarCambios(): void {
    if (!this.nuevoEstado || !this.prestamo) return;

    this.mensajeError = '';
    this.mensajeExito = '';
    this.actualizando = true;

    this.prestamosService.actualizarEstadoPrestamo(
      this.prestamo.id_reserva,
      this.nuevoEstado,
      this.observaciones
    ).subscribe({
      next: () => {
        this.actualizando = false;
        this.mensajeExito = '✓ Estado actualizado correctamente';
        this.actualizarPrestamo.emit();
        setTimeout(() => this.cerrar(), 1500);
      },
      error: (error) => {
        this.actualizando = false;
        this.mensajeError = error.error?.mensaje || 'Error al actualizar el estado.';
      }
    });
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}