import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaInventarioComponent } from '../components/lista-inventario/lista-inventario';

@Component({
  selector: 'app-inventario-page',
  standalone: true,
  imports: [CommonModule, ListaInventarioComponent],
  templateUrl: './inventario-page.html',
  styleUrls: ['./inventario-page.css']
})
export class InventarioPageComponent {}