import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamoActivo, PrestamosActivosService } from '../../../prestamos/services/prestamos-activos.service';

@Component({
  selector: 'app-detalles-prestamo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-detalles-prestamo.html',
  styleUrls: ['./modal-detalles-prestamo.css']
})
export class ModalDetallesPrestamoComponent implements OnInit {
  @Input() prestamo: PrestamoActivo | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() actualizarPrestamo = new EventEmitter<void>();

  private prestamosService = inject(PrestamosActivosService);
  private cdr = inject(ChangeDetectorRef);

  cargando = false;
  actualizando = false;
  nuevoEstado: number | null = null;
  observaciones = '';
  mensajeError = '';
  mensajeExito = '';

  estadosDisponibles = [
    { cod: 1, nombre: 'Solicitado', clase: 'solicitado' },
    { cod: 2, nombre: 'Entregado', clase: 'entregado' },
    { cod: 3, nombre: 'Devuelto', clase: 'devuelto' },
    { cod: 4, nombre: 'Perdido', clase: 'perdido' },
    { cod: 5, nombre: 'Dañado', clase: 'danado' }
  ];

  ngOnInit(): void {
    if (this.prestamo) {
      this.nuevoEstado = this.prestamo.cod_estado_prestamo;
    }
  }

  /**
   * Mientras el préstamo sigue "Solicitado" (aún no se entregó físicamente)
   * la entrega se hace desde el botón "Entregar" de la tabla, que abre la
   * modal donde se asigna la unidad concreta — aquí no hay nada más que
   * cambiar todavía (no hay un equipo en manos del docente que marcar como
   * devuelto/perdido/dañado).
   */
  get opcionesEstado() {
    if (this.prestamo?.cod_estado_prestamo === 1) {
      return [];
    }
    return this.estadosDisponibles;
  }

  get esSolicitadoSinEntregar(): boolean {
    return this.prestamo?.cod_estado_prestamo === 1;
  }

  obtenerNombreEstado(cod: number): string {
    const estado = this.estadosDisponibles.find(e => e.cod === cod);
    return estado ? estado.nombre : 'Desconocido';
  }

  obtenerClaseEstado(cod: number): string {
    const estado = this.estadosDisponibles.find(e => e.cod === cod);
    return estado ? estado.clase : 'inactivo';
  }

  guardarCambios(): void {
    if (!this.nuevoEstado || !this.prestamo) return;

    this.mensajeError = '';
    this.mensajeExito = '';
    this.actualizando = true;

    this.prestamosService.actualizarEstadoPrestamo(this.prestamo.id_Reserva, this.nuevoEstado, this.observaciones).subscribe({
      next: () => {
        this.actualizando = false;
        this.mensajeExito = '✓ Estado actualizado correctamente';
        this.actualizarPrestamo.emit();
        this.cdr.detectChanges();
        setTimeout(() => this.cerrar(), 1500);
      },
      error: (error: any) => {
        this.actualizando = false;
        this.mensajeError = error.error?.mensaje || 'Error al actualizar el estado.';
        this.cdr.detectChanges();
      }
    });
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}