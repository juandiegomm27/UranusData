import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Docente } from './Docente/docente';
import { DashboardResumen } from './dashboard-resumen/dashboard-resumen';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Docente, DashboardResumen, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private route = inject(ActivatedRoute);
  public rolUsuario = signal<string>('');

  ngOnInit(): void {
    const rolUrl = this.route.snapshot.paramMap.get('rol');
    
    // Buscar usuario priorizando sessionStorage (por tu seguridad implementada previamente)
    const usuarioStr = sessionStorage.getItem('usuario') || localStorage.getItem('usuario');
    
    if (usuarioStr) {
      try {
        const parsed = JSON.parse(usuarioStr);
        this.rolUsuario.set(rolUrl || parsed.rol || 'Sin rol');
      } catch {
        this.rolUsuario.set(rolUrl || 'Sin rol');
      }
    } else {
      this.rolUsuario.set(rolUrl || '');
    }
  }
}