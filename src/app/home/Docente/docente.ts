import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// -- ROLES ---

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './docente.html',
  styleUrl: '../home.css'
})
export class Docente {}