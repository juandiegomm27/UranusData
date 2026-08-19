import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioGestorService } from '../../services/usuario-gestor.service';

@Component({
  selector: 'app-historial-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-reservas.html',
  styleUrl: './historial-reservas.css'
})
export class HistorialReservas implements OnInit {
  @Input() documento: string | null = null;
  @Input() estadosReserva: any[] = [];
  @Output() cerrar = new EventEmitter<void>();

  private usuarioGestorService = inject(UsuarioGestorService);

  reservasUsuario: any[] = [];
  paginaReservas = 1;
  perPageReservas = 5;
  totalReservas = 0;
  totalPaginasReservas = 0;

  // Filtros
  filtroEstadoReserva = '';
  filtroElementoReserva = '';
  filtroFechaReserva = '';

  cargando = false;

  ngOnInit(): void {
    this.cargarHistorialReservas();
  }

  cargarHistorialReservas(): void {
    if (!this.documento) return;

    this.cargando = true;
    const filtros = {
      estado: this.filtroEstadoReserva || undefined,
      elemento: this.filtroElementoReserva || undefined,
      fecha: this.filtroFechaReserva || undefined
    };

    // Por ahora cargamos datos vacíos
    // Se conectará con la API en el siguiente paso
    this.reservasUsuario = [];
    this.totalReservas = 0;
    this.totalPaginasReservas = 0;
    this.cargando = false;
  }

  aplicarFiltroReservas(): void {
    this.paginaReservas = 1;
    this.cargarHistorialReservas();
  }

  cambiarPaginaReservas(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasReservas) {
      this.paginaReservas = pagina;
      this.cargarHistorialReservas();
    }
  }

  limpiarFiltros(): void {
    this.filtroEstadoReserva = '';
    this.filtroElementoReserva = '';
    this.filtroFechaReserva = '';
    this.paginaReservas = 1;
    this.cargarHistorialReservas();
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  obtenerNombreEstadoReserva(numEstado: number): string {
    return this.estadosReserva.find(e => e.Num_estado === numEstado)?.estado || 'N/A';
  }

  obtenerClaseEstadoReserva(numEstado: number): string {
    const estado = this.estadosReserva.find(e => e.Num_estado === numEstado)?.estado;
    if (estado === 'Aprobada' || estado === 'Completada') return 'estado-aprobada';
    if (estado === 'Pendiente') return 'estado-pendiente';
    if (estado === 'Rechazada') return 'estado-rechazada';
    return '';
  }
}