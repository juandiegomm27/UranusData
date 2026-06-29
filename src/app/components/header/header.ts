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
    console.log('¡Botón pulsado! Estado actual:', this.fondoService.isOscuro());
    
    // comunicador de cambio de color a app.css
    this.fondoService.toggleFondo();
    
    // comunicador de cambio de color a header.css
    if (this.fondoService.isOscuro()) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
