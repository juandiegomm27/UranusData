import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { FormsModule } from '@angular/forms';
import { FondoService } from './fondo';
import { Section } from './components/section/section';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    Section,
    FormsModule

  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  fondoService = inject(FondoService);

}
