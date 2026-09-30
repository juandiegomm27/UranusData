import { Component, EventEmitter, Input, Output, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { extraerMensajeError } from '../../../shared/utils/api-error.helper';

@Component({
  selector: 'app-baja-accesorio-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './baja-accesorio-modal.html',
  styleUrls: ['./baja-accesorio-modal.css']
})
export class BajaAccesorioModalComponent {
  @Input() accesorio: any = null;
  @Input() stock: any = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() completado = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  cantidad = 1;
  motivo = '';
  procesando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  confirmar(): void {
    if (!Number.isInteger(this.cantidad) || this.cantidad <= 0 || this.cantidad > this.stock.cantidad_disponible) {
      this.mensaje = 'No puedes dar de baja más elementos de los que hay disponibles';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.motivo.trim()) {
      this.mensaje = 'Por favor, ingrese el motivo de la baja';
      this.tipoMensaje = 'error';
      return;
    }

    this.procesando = true;
    this.inventarioService.darDeBajaAccesorio(this.stock.id_stock, {
      cantidad: this.cantidad,
      motivo: this.motivo.trim()
    }).subscribe({
      next: (res: any) => {
        this.mensaje = res?.mensaje || 'Unidades dadas de baja exitosamente';
        this.tipoMensaje = 'success';
        this.procesando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.completado.emit(), 1500);
      },
      error: (err: any) => {
        this.mensaje = extraerMensajeError(err, 'Error al procesar la baja');
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