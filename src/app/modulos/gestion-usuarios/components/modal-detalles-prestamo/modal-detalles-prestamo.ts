import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamoActivo, PrestamosActivosService } from '../../../prestamos/services/prestamos-activos.service';

@Component({
  selector: 'app-modal-detalles-prestamo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-detalles-prestamo.html',
  styleUrls: ['./modal-detalles-prestamo.css']
})
export class ModalDetallesPrestamo implements OnInit {
  @Input() prestamo: PrestamoActivo | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() actualizarPrestamo = new EventEmitter<{ idReserva: number; nuevoEstado: number; observaciones: string }>();

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
    // Modal listo al inicializar
  }

  /**
   * Obtener nombre del estado
   */
  obtenerNombreEstado(cod: number): string {
    const estado = this.estadosDisponibles.find(e => e.cod === cod);
    return estado ? estado.nombre : 'Desconocido';
  }

  /**
   * Obtener clase CSS del estado
   */
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

  /**
   * Guardar cambios
   */
  guardarCambios(): void {
    if (!this.nuevoEstado || !this.prestamo) return;

    this.mensajeError = '';
    this.mensajeExito = '';
    this.actualizando = true;

    this.prestamosService
      .actualizarEstadoPrestamo(
        this.prestamo.id_reserva,
        this.nuevoEstado,
        this.observaciones
      )
      .subscribe({
        next: (response) => {
          this.actualizando = false;
          this.mensajeExito = '✓ Estado actualizado correctamente';

          // Emitir evento para que el padre recargue la lista
          this.actualizarPrestamo.emit({
            idReserva: this.prestamo!.id_reserva,
            nuevoEstado: this.nuevoEstado!,
            observaciones: this.observaciones
          });

          // Cerrar modal después de 1.5s
          setTimeout(() => this.cerrar(), 1500);
        },
        error: (error) => {
          this.actualizando = false;
          this.mensajeError = error.error?.mensaje || 'Error al actualizar el estado. Intenta nuevamente.';
          console.error('Error actualizando estado:', error);
        }
      });
  }

  /**
   * Cerrar modal
   */
  cerrar(): void {
    this.cerrarModal.emit();
  }
}