import { Component, Output, EventEmitter, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MantenimientoService } from '../../services/mantenimiento.service';

@Component({
  selector: 'app-detalle-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-mantenimiento.html',
  styleUrls: ['./detalle-mantenimiento.css']
})
export class DetalleMantenimientoComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Input() mostrar = false;
  @Input() mantenimiento: any = null;
  @Input() estadosMantenimiento: any[] = []; 
  @Input() accionDirecta: number | null = null;

  completando = false;
  cargando = false;
  accionSeleccionadaCod: number = 3; 
  observaciones_tecnicas = '';
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  private cdr = inject(ChangeDetectorRef);

  constructor(private mantenimientoService: MantenimientoService) {}

  ngOnChanges(): void {
    if (this.mostrar && this.accionDirecta) {
      this.abrirCompletar(this.accionDirecta);
    }
  }
  
  obtenerNombreEstado(cod: any): string {
    if (cod == 4) return 'Dado de Baja'; 
    if (cod == 3) return 'Finalizado';
    const estado = this.estadosMantenimiento.find(e => e.cod_estado_mantenimiento == cod);
    return estado ? estado.estado : 'Desconocido';
  }

  abrirCompletar(codAccion: number): void {
    this.accionSeleccionadaCod = codAccion;
    this.completando = true;
    this.observaciones_tecnicas = this.mantenimiento.observaciones || '';
  }

  cancelarCompletar(): void {
    this.completando = false;
    this.observaciones_tecnicas = '';
    this.mensaje = '';
  }

  guardarCompletado(): void {
    if (!this.observaciones_tecnicas || !this.observaciones_tecnicas.trim()) {
      this.mensaje = 'Debes ingresar las observaciones requeridas.';
      this.tipoMensaje = 'error';
      this.cdr.detectChanges();
      return;
    }
    
    this.cargando = true;
    
    this.mantenimientoService.completarMantenimiento(
      this.mantenimiento.id_mantenimiento, 
      this.observaciones_tecnicas.trim(), 
      this.accionSeleccionadaCod // ENVIAMOS EL ID (2 o 3)
    ).subscribe({
      next: (response: any) => {
        if (response.success !== false) {
          this.mensaje = `Mantenimiento actualizado exitosamente.`;
          this.tipoMensaje = 'success';
          this.completando = false;
          
          this.mantenimiento.cod_estado_mantenimiento = this.accionSeleccionadaCod;
          this.mantenimiento.observaciones = this.observaciones_tecnicas;
          
          setTimeout(() => { this.cerrarModal(); }, 1500);
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensaje = 'Error al procesar la solicitud.';
        this.tipoMensaje = 'error';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModal(): void { this.cerrar.emit(); }
}