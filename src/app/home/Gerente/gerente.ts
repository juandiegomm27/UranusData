import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrestamosActivosService } from '../../modulos/gestion-usuarios/services/prestamos-activos.service';

@Component({
  selector: 'app-gerente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gerente.html',
  styleUrl: '../home.css'
})
export class Gerente implements OnInit {
  private prestamosService = inject(PrestamosActivosService);

  prestamosActivos = signal<number | null>(null);

  ngOnInit(): void {
    this.prestamosService.obtenerPrestamosActivos(1, 1).subscribe({
      next: (response) => {
        this.prestamosActivos.set(response.pagination?.total ?? 0);
      },
      error: (error) => {
        console.error('Error cargando préstamos activos:', error);
        this.prestamosActivos.set(null);
      }
    });
  }
}