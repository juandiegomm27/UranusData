import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tecnico',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tecnico.html',
  styleUrl: '../home.css'
})
export class Tecnico {}