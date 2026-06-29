import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { FormsModule } from '@angular/forms';
import { FondoService } from './core/service/fondo';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Header,
    FormsModule,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  fondoService = inject(FondoService);
}
