import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-en-construccion',
  standalone: true,
  imports: [],
  templateUrl: './en-construccion.html',
  styleUrl: '../../section/section.css'
})
export class EnConstruccion {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  // Toma el nombre del módulo desde los datos de la ruta (ej. "Inventario")
  public nombreModulo = this.route.snapshot.data['nombreModulo'] || 'Este módulo';

  irAlInicio(): void {
    this.authService.irAlInicio(this.router);
  }
}