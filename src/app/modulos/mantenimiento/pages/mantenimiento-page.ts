import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaMantenimientoComponent } from '../components/lista-mantenimiento/lista-mantenimiento';

@Component({
  selector: 'app-mantenimiento-page',
  standalone: true,
  imports: [CommonModule, ListaMantenimientoComponent],
  templateUrl: './mantenimiento-page.html',
  styleUrls: ['./mantenimiento-page.css']
})
export class MantenimientoPageComponent {}