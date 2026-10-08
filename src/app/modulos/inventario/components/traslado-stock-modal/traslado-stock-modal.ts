import { Component, EventEmitter, Input, Output, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { extraerMensajeError } from '../../../shared/utils/api-error.helper';

@Component({
  selector: 'app-traslado-stock-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './traslado-stock-modal.html',
  styleUrls: ['./traslado-stock-modal.css']
})
export class TrasladoStockModalComponent {
  @Input() accesorio: any = null;
  @Input() stock: any = null;
  @Input() ubicaciones: any[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() completado = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  cantidad = 1;
  ubicacionDestino = '';
  procesando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  confirmar(): void {
    if (!Number.isInteger(this.cantidad) || this.cantidad <= 0 || this.cantidad > this.stock.cantidad_disponible) {
      this.mensaje = 'Cantidad inválida para trasladar';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.ubicacionDestino || this.ubicacionDestino == this.stock.cod_ubi_elemento) {
      this.mensaje = 'Seleccione una ubicación de destino válida y diferente a la actual';
      this.tipoMensaje = 'error';
      return;
    }

    this.procesando = true;
    this.inventarioService.trasladarStock({
      id_stock_origen: this.stock.id_stock,
      cod_ubi_destino: Number(this.ubicacionDestino),
      cantidad: this.cantidad
    }).subscribe({
      next: (res: any) => {
        this.mensaje = res?.mensaje || 'Stock trasladado exitosamente';
        this.tipoMensaje = 'success';
        this.procesando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.completado.emit(), 1500);
      },
      error: (err: any) => {
        this.mensaje = extraerMensajeError(err, 'Error al trasladar el stock');
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