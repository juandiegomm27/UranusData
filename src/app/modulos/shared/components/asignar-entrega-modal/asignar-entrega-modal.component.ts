import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AsignacionElemento,
  CandidatoElemento,
  DetallePendiente,
  PrestamoActivo,
  PrestamosActivosService
} from '../../../prestamos/services/prestamos-activos.service';

@Component({
  selector: 'app-asignar-entrega-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignar-entrega-modal.component.html',
  styleUrls: ['./asignar-entrega-modal.component.css']
})
export class AsignarEntregaModalComponent implements OnInit {
  @Input({ required: true }) prestamo!: PrestamoActivo;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() entregaConfirmada = new EventEmitter<void>();

  private prestamosService = inject(PrestamosActivosService);

  // Signals: esta app corre sin zone.js, así que el estado que se llena
  // desde respuestas HTTP (asíncronas) debe ser un signal para que la
  // vista se vuelva a pintar.
  cargando = signal(true);
  entregando = signal(false);
  mensajeError = signal('');
  detallesPendientes = signal<DetallePendiente[]>([]);
  candidatosPorTipo = signal<Record<number, CandidatoElemento[]>>({});

  seleccion: Record<number, number | null> = {};

  ngOnInit(): void {
    this.prestamosService.obtenerElementosParaAsignar(this.prestamo.id_Reserva).subscribe({
      next: (res) => {
        const pendientes: DetallePendiente[] = res.data?.detalles_pendientes || [];
        this.detallesPendientes.set(pendientes);
        this.candidatosPorTipo.set(res.data?.candidatos || {});
        pendientes.forEach(d => (this.seleccion[d.id_detalle] = null));
        this.cargando.set(false);
      },
      error: (err) => {
        this.mensajeError.set(err.error?.mensaje || 'No se pudieron cargar las unidades disponibles.');
        this.cargando.set(false);
      }
    });
  }

  candidatosDe(tipo: number): CandidatoElemento[] {
    return this.candidatosPorTipo()[tipo] || [];
  }

  /** Para no dejar elegir la misma unidad física en dos desplegables a la vez. */
  yaElegidoEnOtro(idDetalle: number, idElemento: number): boolean {
    return Object.entries(this.seleccion).some(
      ([detalle, elemento]) => Number(detalle) !== idDetalle && elemento === idElemento
    );
  }

  get faltanAsignaciones(): boolean {
    return this.detallesPendientes().some(d => !this.seleccion[d.id_detalle]);
  }

  confirmarEntrega(): void {
    if (this.faltanAsignaciones || this.entregando()) return;

    const asignaciones: AsignacionElemento[] = this.detallesPendientes().map(d => ({
      id_detalle: d.id_detalle,
      id_elemento: this.seleccion[d.id_detalle]!
    }));

    this.entregando.set(true);
    this.mensajeError.set('');

    this.prestamosService.entregarPrestamo(this.prestamo.id_Reserva, asignaciones).subscribe({
      next: () => {
        this.entregando.set(false);
        this.entregaConfirmada.emit();
      },
      error: (err) => {
        this.entregando.set(false);
        this.mensajeError.set(err.error?.mensaje || 'No se pudo procesar la entrega.');
      }
    });
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}
