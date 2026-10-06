import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../services/inventario.service';
import { PaginationHelper } from '../../../shared/utils/pagination.helper';

@Component({
  selector: 'app-historial-bajas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-bajas.html',
  styleUrls: ['./historial-bajas.css']
})
export class HistorialBajasComponent extends PaginationHelper implements OnChanges {
  @Input() mostrar = false;
  @Input() tipoItem: 'activo' | 'accesorio' = 'activo';
  @Output() cerrar = new EventEmitter<void>();
  @Output() recargar = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  historialBajas: any[] = [];
  totalUnidadesBaja = 0;
  mensajeModal = '';
  tipoMensajeModal: 'success' | 'error' = 'success';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && this.mostrar) {
      this.paginaActual = 1;
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    this.inventarioService.obtenerHistorialBajasGeneral(this.tipoItem, this.paginaActual).subscribe({
      next: (res: any) => {
        const pagina = res?.data;
        this.historialBajas = pagina?.data || [];
        this.totalElementos = pagina?.total ?? res?.resumen?.registros ?? 0;
        this.totalPaginas = pagina?.last_page || 1;
        this.totalUnidadesBaja = res?.resumen?.unidades ?? 0;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar historial:', err);
        this.historialBajas = [];
        this.totalElementos = 0;
        this.totalPaginas = 1;
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

        // Si era el único registro de la última página, retrocede una página
        if (this.historialBajas.length === 1 && this.paginaActual > 1) {
          this.paginaActual--;
        }

        this.cargarDatos();
        this.recargar.emit();
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