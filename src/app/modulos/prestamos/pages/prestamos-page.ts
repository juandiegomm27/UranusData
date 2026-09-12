// 2. src/app/modulos/prestamos/pages/prestamos-page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaPrestamosComponent } from '../components/lista-prestamos/lista-prestamos';

@Component({
  selector: 'app-prestamos-page',
  standalone: true,
  imports: [CommonModule, ListaPrestamosComponent],
  templateUrl: './prestamos-page.html',
  styles: [`:host { display: block; width: 100%; }`]
})
export class PrestamosPageComponent {}