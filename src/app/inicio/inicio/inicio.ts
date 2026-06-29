import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: '../../components/section/section.css' // <-- Corregido: Sube 2 niveles para buscar el CSS del login
})
export class Inicio {
  // Maneja la presentación inicial de forma limpia
}
