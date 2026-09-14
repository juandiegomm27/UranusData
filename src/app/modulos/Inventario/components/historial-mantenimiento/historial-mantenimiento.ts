import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-historial-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-mantenimiento.html',
  styleUrls: ['./historial-mantenimiento.css']
})
export class HistorialMantenimientoComponent implements OnInit {
  @Input() mostrar = false;
  @Input() elemento: any = null;
  @Output() cerrar = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  historialMantenimientos: any[] = [];
  historialOriginal: any[] = [];
  
  filtroEstadoMant = '';
  filtroTipoMant = '';
  filtroFechaMant = '';
  
  cargando = true; // Agregamos la variable de carga

  ngOnInit(): void {
    if (this.elemento && this.elemento.id_elemento) {
      this.cargarHistorial();
    }
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.inventarioService.obtenerHistorialMantenimiento(this.elemento.id_elemento).subscribe({
      next: (res: any) => {
        // Soporta respuesta de Laravel (res.data) o arreglo directo (res)
        this.historialMantenimientos = res?.data || res || [];
        this.historialOriginal = [...this.historialMantenimientos];
        this.cargando = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error al cargar historial', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    this.historialMantenimientos = this.historialOriginal.filter(mant => {
      const coincideEstado = this.filtroEstadoMant ? mant.cod_estado_mantenimiento == this.filtroEstadoMant : true;
      const coincideTipo = this.filtroTipoMant ? (mant.tipo && mant.tipo.toLowerCase().includes(this.filtroTipoMant.toLowerCase())) : true;
      const coincideFecha = this.filtroFechaMant ? mant.fecha === this.filtroFechaMant : true;
      return coincideEstado && coincideTipo && coincideFecha;
    });
  }

  limpiarFiltros(): void {
    this.filtroEstadoMant = '';
    this.filtroTipoMant = '';
    this.filtroFechaMant = '';
    this.historialMantenimientos = [...this.historialOriginal];
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}