import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../services/inventario.service';
import { PaginationHelper } from '../../../shared/utils/pagination.helper';
import { etiquetaTipoMovimiento, claseTipoMovimiento } from '../../inventario.constants';

@Component({
  selector: 'app-historial-movimientos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-movimientos.html',
  styleUrls: ['./historial-movimientos.css']
})
export class HistorialMovimientosComponent extends PaginationHelper implements OnInit {
  @Input() elemento: any = null;
  @Output() cerrar = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  movimientos: any[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    if (!this.elemento?.id_elemento) return;

    this.cargando = true;
    this.inventarioService.obtenerMovimientos(this.elemento.id_elemento, this.paginaActual, this.perPage).subscribe({
      next: (res: any) => {
        this.movimientos = res?.data || [];
        this.totalElementos = res?.total || 0;
        this.totalPaginas = res?.last_page || 1;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar movimientos:', err);
        this.movimientos = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  etiquetaTipo(tipo: string): string { return etiquetaTipoMovimiento(tipo); }
  claseTipo(tipo: string): string { return claseTipoMovimiento(tipo); }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}