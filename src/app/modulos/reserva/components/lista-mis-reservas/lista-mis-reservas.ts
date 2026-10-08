import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoCalculadoReserva, Reserva, ReservaService } from '../../services/reserva.service';

type Pestana = EstadoCalculadoReserva | 'todas';

@Component({
  selector: 'app-lista-mis-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-mis-reservas.html',
  styleUrl: './lista-mis-reservas.css'
})
export class ListaMisReservasComponent implements OnInit {
  private reservaService = inject(ReservaService);

  @Input() modoEdicion = false;

  // Signals: esta app corre sin zone.js, así que el estado que se llena
  // desde respuestas HTTP (asíncronas) debe ser un signal para que la
  // vista se vuelva a pintar; una propiedad normal mutada en un
  // subscribe() no dispara change detection.
  reservas = signal<Reserva[]>([]);
  cargando = signal(false);
  guardandoEdicion = signal(false);
  mensajeErrorEdicion = signal('');

  pestanaActiva: Pestana = 'activa';
  reservaEditando: Reserva | null = null;
  fechaEdicion = '';
  plazoEdicion = '';

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando.set(true);
    this.reservaService.obtenerMisReservas().subscribe({
      next: (res) => {
        this.reservas.set(res.data || []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  get reservasFiltradas(): Reserva[] {
    if (this.pestanaActiva === 'todas') return this.reservas();
    return this.reservas().filter(r => r.estado_calculado === this.pestanaActiva);
  }

  contar(pestana: EstadoCalculadoReserva): number {
    return this.reservas().filter(r => r.estado_calculado === pestana).length;
  }

  cambiarPestana(pestana: Pestana): void {
    this.pestanaActiva = pestana;
  }

  nombresDetalles(reserva: Reserva): string {
    if (!reserva.detalles || reserva.detalles.length === 0) return 'Sin elementos';
    return reserva.detalles
      .map(d => {
        const nombre = d.elemento?.nombre_elemento || d.stock?.accesorio?.nombre || 'Elemento';
        return `${nombre} (${d.cantidad_solicitada})`;
      })
      .join(', ');
  }

  etiquetaEstado(reserva: Reserva): string {
    const etiquetas: Record<EstadoCalculadoReserva, string> = {
      activa: 'Activa',
      no_recogida: 'No recogida',
      en_prestamo: 'En préstamo',
      rechazada: 'Rechazada'
    };
    return reserva.estado_calculado ? etiquetas[reserva.estado_calculado] : 'Desconocido';
  }

  claseEstado(reserva: Reserva): string {
    const clases: Record<EstadoCalculadoReserva, string> = {
      activa: 'estado-activo',
      no_recogida: 'estado-pendiente',
      en_prestamo: 'estado-aprobada',
      rechazada: 'estado-rechazada'
    };
    return reserva.estado_calculado ? clases[reserva.estado_calculado] : '';
  }

  puedeEditar(reserva: Reserva): boolean {
    return reserva.estado_calculado === 'activa' || reserva.estado_calculado === 'no_recogida';
  }

  abrirEdicion(reserva: Reserva): void {
    this.reservaEditando = reserva;
    this.fechaEdicion = reserva.fecha?.substring(0, 10) || '';
    this.plazoEdicion = reserva.plazo?.substring(0, 10) || '';
    this.mensajeErrorEdicion.set('');
  }

  cerrarEdicion(): void {
    this.reservaEditando = null;
  }

  guardarEdicion(): void {
    if (!this.reservaEditando || this.guardandoEdicion()) return;

    this.guardandoEdicion.set(true);
    this.mensajeErrorEdicion.set('');

    this.reservaService.actualizarReserva(this.reservaEditando.id_Reserva, {
      fecha: this.fechaEdicion,
      plazo: this.plazoEdicion
    }).subscribe({
      next: () => {
        this.guardandoEdicion.set(false);
        this.cerrarEdicion();
        this.cargarReservas();
      },
      error: (err) => {
        this.guardandoEdicion.set(false);
        this.mensajeErrorEdicion.set(err.error?.mensaje || 'No se pudo actualizar la reserva.');
      }
    });
  }

  cancelarReserva(reserva: Reserva): void {
    if (!confirm('¿Seguro que quieres cancelar esta reserva? Esta acción no se puede deshacer.')) return;

    this.reservaService.cancelarReserva(reserva.id_Reserva).subscribe({
      next: () => this.cargarReservas(),
      error: (err) => alert(err.error?.mensaje || 'No se pudo cancelar la reserva.')
    });
  }
}
