import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-historial-bajas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-bajas.html',
  styleUrls: ['./historial-bajas.css']
})
export class HistorialBajasComponent implements OnChanges {
  @Input() mostrar = false;
  @Input() tipoItem: 'activo' | 'accesorio' = 'activo';
  @Output() cerrar = new EventEmitter<void>();
  @Output() recargar = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  historialBajas: any[] = [];
  totalUnidadesBaja = 0;
  cargando = false;
  mensajeModal = '';
  tipoMensajeModal: 'success' | 'error' = 'success';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && this.mostrar) {
      this.cargarHistorial();
    }
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.inventarioService.obtenerHistorialBajasGeneral(this.tipoItem).subscribe({
      next: (res: any) => {
        const items = res?.data?.data || res?.data || [];
        this.historialBajas = items;
        this.totalUnidadesBaja = this.historialBajas.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar historial:', err);
        this.historialBajas = [];
        this.totalUnidadesBaja = 0;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  restaurarItem(baja: any): void {
    if (!confirm(`¿Estás seguro de restaurar "${baja.nombre}" al inventario?`)) {
      return;
    }
    
    this.inventarioService.restaurarBaja(baja.id_baja).subscribe({
      next: (res: any) => {
        this.mensajeModal = res.mensaje || 'Elemento restaurado exitosamente';
        this.tipoMensajeModal = 'success';
        this.cargarHistorial(); // Recargar la tabla local
        this.recargar.emit();   // Avisar al componente padre que recargue su tabla
        this.cdr.detectChanges();

        setTimeout(() => {
          this.mensajeModal = '';
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err: any) => {
        this.mensajeModal = err.error?.mensaje || 'Error al restaurar';
        this.tipoMensajeModal = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModal(): void {
    this.mensajeModal = '';
    this.cerrar.emit();
  }
}