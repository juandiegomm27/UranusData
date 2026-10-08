import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReservaService } from '../../modulos/reserva/services/reserva.service';

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './docente.html',
  styleUrl: './docente.css'
})
export class Docente implements OnInit {
  private reservaService = inject(ReservaService);

  // Datos del usuario
  nombreUsuario = signal<string>('');
  rolUsuario = signal<string>('Docente');

  // Métricas del docente
  reservasActivas = signal<number | null>(null);
  solicitudesPendientes = signal<number | null>(null);
  prestamosActuales = signal<number | null>(null);

  // Lógica del Calendario Institucional
  fechaActual = signal<Date>(new Date());
  nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  textoMesAnio = computed(() => {
    const fecha = this.fechaActual();
    return `${this.nombresMeses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  });

  matrizDias = computed(() => {
    const fecha = this.fechaActual();
    const ano = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDiaIndex = new Date(ano, mes, 1).getDay();
    const diasTotales = new Date(ano, mes + 1, 0).getDate();
    
    const celdas: { numero: number | null; esHoy: boolean }[] = [];
    for (let i = 0; i < primerDiaIndex; i++) {
      celdas.push({ numero: null, esHoy: false });
    }
    
    const hoy = new Date();
    for (let dia = 1; dia <= diasTotales; dia++) {
      const esHoy = hoy.getDate() === dia && hoy.getMonth() === mes && hoy.getFullYear() === ano;
      celdas.push({ numero: dia, esHoy });
    }
    return celdas;
  });

  ngOnInit(): void {
    // Cargar datos del usuario logueado
    const usuarioStr = sessionStorage.getItem('usuario') || localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const parsed = JSON.parse(usuarioStr);
        this.nombreUsuario.set(parsed.nombre || '');
        this.rolUsuario.set(parsed.rol || 'Docente');
      } catch (e) {
        console.error('Error parseando usuario', e);
      }
    }

    this.cargarMetricasReservas();
  }

  private cargarMetricasReservas(): void {
    this.reservaService.obtenerMisReservas().subscribe({
      next: (res) => {
        const reservas = res.data || [];
        this.reservasActivas.set(reservas.filter((r: any) => r.estado_calculado === 'activa').length);
        this.prestamosActuales.set(reservas.filter((r: any) => r.estado_calculado === 'en_prestamo').length);
      },
      error: () => {
        this.reservasActivas.set(0);
        this.prestamosActuales.set(0);
      }
    });
  }

  mesAnterior(): void {
    const actual = this.fechaActual();
    this.fechaActual.set(new Date(actual.getFullYear(), actual.getMonth() - 1, 1));
  }

  mesSiguiente(): void {
    const actual = this.fechaActual();
    this.fechaActual.set(new Date(actual.getFullYear(), actual.getMonth() + 1, 1));
  }

  seleccionarDia(dia: number): void {
    console.log(`Día seleccionado: ${dia}/${this.fechaActual().getMonth() + 1}/${this.fechaActual().getFullYear()}`);
  }
}