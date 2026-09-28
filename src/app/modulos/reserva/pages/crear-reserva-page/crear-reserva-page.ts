import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectorCatalogoComponent } from '../../components/selector-catalogo/selector-catalogo';
import { DetalleReservaPayload, ReservaService } from '../../services/reserva.service';

@Component({
  selector: 'app-crear-reserva-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectorCatalogoComponent],
  templateUrl: './crear-reserva-page.html',
  styleUrl: './crear-reserva-page.css'
})
export class CrearReservaPageComponent {
  private reservaService = inject(ReservaService);
  private router = inject(Router);

  // La fecha de la reserva siempre es hoy: no se le pide al docente.
  fecha: string = new Date().toISOString().substring(0, 10);
  plazo: string = '';
  detalles: DetalleReservaPayload[] = [];

  // Signal: se actualiza dentro del subscribe() de una petición HTTP
  // (asíncrona); sin zone.js en este proyecto, una propiedad normal ahí
  // no repinta la vista.
  guardando = signal(false);
  mensajeError = signal('');

  onCambioSeleccion(detalles: DetalleReservaPayload[]): void {
    this.detalles = detalles;
  }

  get formularioValido(): boolean {
    return !!this.plazo && this.detalles.length > 0;
  }

  get mensajesFaltantes(): string[] {
    const faltantes: string[] = [];
    if (this.detalles.length === 0) faltantes.push('selecciona al menos un elemento del catálogo');
    if (!this.plazo) faltantes.push('define la fecha límite para recoger');
    return faltantes;
  }

  guardar(): void {
    if (!this.formularioValido || this.guardando()) return;

    this.guardando.set(true);
    this.mensajeError.set('');

    this.reservaService.crearReserva(this.fecha, this.plazo, this.detalles).subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/reserva/consultar']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.mensajeError.set(err.error?.mensaje || 'No se pudo crear la reserva. Intenta de nuevo.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/home/Docente']);
  }
}
