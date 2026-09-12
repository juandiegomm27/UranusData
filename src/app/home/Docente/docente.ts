import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './docente.html',
  styleUrl: '../home.css'
})
export class Docente implements OnInit {
  reservasActivas = signal<number | null>(null);
  solicitudesPendientes = signal<number | null>(null);
  prestamosActuales = signal<number | null>(null);

  ngOnInit(): void {
  }
}