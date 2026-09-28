import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaMisReservasComponent } from '../../components/lista-mis-reservas/lista-mis-reservas';

@Component({
  selector: 'app-editar-reserva-page',
  standalone: true,
  imports: [CommonModule, ListaMisReservasComponent],
  templateUrl: './editar-reserva-page.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class EditarReservaPageComponent {}
