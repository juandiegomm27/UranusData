import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Main } from "./components/main/main";
import { FormsModule } from '@angular/forms';
import { FondoService } from './fondo';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    Header, 
    Main, 
    FormsModule

  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  fondoService = inject(FondoService);

}
