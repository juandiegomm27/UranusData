import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../core/service/contacto.service';

@Component({
  selector: 'app-contacto-interno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto-interno.html',
  styleUrl: './contacto-interno.css'
})
export class ContactoInternoComponent {
  private contactoService = inject(ContactoService);

  asunto = '';
  descripcion = '';
  enviando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  enviarMensaje(): void {
    if (!this.asunto.trim() || !this.descripcion.trim()) {
      this.mensaje = 'Por favor completa el asunto y la descripción.';
      this.tipoMensaje = 'error';
      return;
    }

    // 1. Mostrar estado de carga Inmediatamente al usuario
    this.enviando = true;
    this.tipoMensaje = 'success';
    this.mensaje = 'Enviando mensaje al servidor, por favor espera unos segundos...';

    this.contactoService.enviarMensaje({
      asunto: this.asunto.trim(),
      descripcion: this.descripcion.trim()
    }).subscribe({
      next: (res: any) => {
        // 2. Éxito: Limpiar campos y mostrar confirmación final
        this.mensaje = res.mensaje || 'Tu mensaje fue enviado correctamente. Te responderemos pronto.';
        this.tipoMensaje = 'success';
        this.enviando = false;
        this.asunto = '';
        this.descripcion = '';
      },
      error: (err: any) => {
        console.error('Error enviando mensaje de contacto:', err);
        // 3. Error: Mostrar el mensaje de bloqueo de 2 horas o error de servidor
        this.mensaje = err.error?.mensaje || 'Ocurrió un error de red al intentar enviar tu mensaje. Intenta nuevamente.';
        this.tipoMensaje = 'error';
        this.enviando = false;
      }
    });
  }
}