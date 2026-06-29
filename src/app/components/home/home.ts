import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Docente } from './Docente/docente';
import { Tecnico } from './Tecnico/tecnico';
import { Gerente } from './Gerente/gerente';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Docente, Tecnico, Gerente, CommonModule], 
  templateUrl: './home.html', 
  styleUrl: './home.css'      
})
export class Home implements OnInit {
  private route = inject(ActivatedRoute);
  public rolUsuario = signal<string>('');

    // ==========================================================================
  // LÓGICA REACTIVA DEL CALENDARIO INTELIGENTE (NOMBRES LIMPIOS)
  // ==========================================================================
  public fechaActual = signal<Date>(new Date());
  public nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // CORREGIDO: Nombre con 'n' normal para evitar errores de sintaxis
  public textoMesAnio = computed(() => {
    const fecha = this.fechaActual();
    return `${this.nombresMeses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  });

  // Calcula matemáticamente la rejilla de celdas para el mes actual
  public matrizDias = computed(() => {
    const fecha = this.fechaActual();
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();

    // Índice del primer día del mes (0 = Domingo, 1 = Lunes...)
    const primerDiaIndex = new Date(año, mes, 1).getDay();
    // Cantidad total de días del mes actual
    const diasTotales = new Date(año, mes + 1, 0).getDate();

    const celdas: { numero: number | null; esHoy: boolean }[] = [];

    // Añade casillas vacías de compensación para alinear el día 1 de la semana
    for (let i = 0; i < primerDiaIndex; i++) {
      celdas.push({ numero: null, esHoy: false });
    }

    // Registra los números de los días y resalta la fecha de hoy real del reloj
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
  }

  // MÉTODOS DE INTERACCIÓN NATIVOS
  mesAnterior(): void {
    const actual = this.fechaActual();
    this.fechaActual.set(new Date(actual.getFullYear(), actual.getMonth() - 1, 1));
  }

  mesSiguiente(): void {
    const actual = this.fechaActual();
    this.fechaActual.set(new Date(actual.getFullYear(), actual.getMonth() + 1, 1));
  }

  seleccionarDia(dia: number): void {
    console.log(`Día seleccionado para el panel: ${dia}/${this.fechaActual().getMonth() + 1}/${this.fechaActual().getFullYear()}`);
    // Aquí amarraremos los modales de reserva o asignación de mantenimientos más adelante
  }
}
