import { Component, EventEmitter, Input, Output, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { extraerMensajeError } from '../../../shared/utils/api-error.helper';

@Component({
  selector: 'app-baja-activo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './baja-activo-modal.html',
  styleUrls: ['./baja-activo-modal.css']
})
export class BajaActivoModalComponent {
  @Input() elemento: any = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() completado = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  motivo = '';
  procesando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  confirmar(): void {
    if (!this.motivo.trim()) {
      this.mensaje = 'Por favor, ingrese el motivo de la baja';
      this.tipoMensaje = 'error';
      return;
    }

    this.procesando = true;
    this.inventarioService.darDeBajaElemento(this.elemento.id_elemento, { motivo: this.motivo.trim() }).subscribe({
      next: (res: any) => {
        this.mensaje = res?.mensaje || 'Elemento dado de baja exitosamente';
        this.tipoMensaje = 'success';
        this.procesando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.completado.emit(), 1500);
      },
      error: (err: any) => {
        this.mensaje = extraerMensajeError(err, 'Error al dar de baja el elemento');
        this.tipoMensaje = 'error';
        this.procesando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}