import { Component, inject, ChangeDetectorRef } from '@angular/core'; 
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
  private cdr = inject(ChangeDetectorRef); 

  asunto = '';
  descripcion = '';
  enviando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';
  motivo = '';

  enviarMensaje(): void {
    if (!this.motivo || !this.asunto.trim() || !this.descripcion.trim()) {
      this.mensaje = 'Por favor selecciona un motivo y completa todos los campos.';
      this.tipoMensaje = 'error';
      return;
    }

    this.enviando = true;
    this.tipoMensaje = 'success';
    this.mensaje = 'Enviando mensaje al servidor, por favor espera unos segundos...';
    this.cdr.detectChanges(); 

    this.contactoService.enviarMensaje({
      motivo: this.motivo,
      asunto: this.asunto.trim(),
      descripcion: this.descripcion.trim()
    }).subscribe({
      next: (res: any) => {
        this.mensaje = res.message || res.mensaje || 'Tu mensaje fue enviado correctamente. Te responderemos pronto.';
        this.tipoMensaje = 'success';
        this.enviando = false;
        this.asunto = '';
        this.descripcion = '';
        this.motivo = '';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error enviando mensaje de contacto:', err);
        this.mensaje = err.error?.message || err.error?.mensaje || 'Ocurrió un error de red al intentar enviar tu mensaje. Intenta nuevamente.';
        this.tipoMensaje = 'error';
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }
}