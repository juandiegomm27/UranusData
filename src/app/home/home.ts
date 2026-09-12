import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Docente } from './Docente/docente';
import { DashboardResumen } from './dashboard-resumen/dashboard-resumen';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Docente, DashboardResumen, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private route = inject(ActivatedRoute);
  public rolUsuario = signal<string>('');
  public nombreUsuario = signal<string>('');

  public fechaActual = signal<Date>(new Date());
  public nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  public textoMesAnio = computed(() => {
    const fecha = this.fechaActual();
    return `${this.nombresMeses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  });

  public matrizDias = computed(() => {
    const fecha = this.fechaActual();
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();

    const primerDiaIndex = new Date(año, mes, 1).getDay();
    const diasTotales = new Date(año, mes + 1, 0).getDate();

    const celdas: { numero: number | null; esHoy: boolean }[] = [];

    for (let i = 0; i < primerDiaIndex; i++) {
      celdas.push({ numero: null, esHoy: false });
    }

    const hoy = new Date();
    for (let dia = 1; dia <= diasTotales; dia++) {
      const esHoy = hoy.getDate() === dia && hoy.getMonth() === mes && hoy.getFullYear() === año;
      celdas.push({ numero: dia, esHoy });
    }

    return celdas;
  });

  ngOnInit(): void {
    const rolUrl = this.route.snapshot.paramMap.get('rol');
    if (rolUrl) {
      this.rolUsuario.set(rolUrl);
    }

    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const parsed = JSON.parse(usuario);
        this.nombreUsuario.set(parsed.nombre || '');

        if (!rolUrl) {
          this.rolUsuario.set(parsed.rol || 'Sin rol');
        }
      } catch (e) {
        console.error('Error al parsear usuario:', e);
        if (!rolUrl) {
          this.rolUsuario.set('Sin rol');
        }
      }
    }
  }

  esDashboardResumen(): boolean {
    return this.rolUsuario() === 'Gerente' || this.rolUsuario() === 'Tecnico';
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