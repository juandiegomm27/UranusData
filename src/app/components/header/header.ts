import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FondoService } from '../../fondo';


@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
   private fondoService = inject(FondoService);

  cambiarModo(): void {
    // Añade este console.log para ver en el navegador si responde al clic
    console.log('¡Botón pulsado! Estado actual:', this.fondoService.isOscuro());
    this.fondoService.toggleFondo();
  }
}
