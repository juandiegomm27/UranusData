import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-detalle-elemento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-elemento.html',
  styleUrls: ['./detalle-elemento.css']
})
export class DetalleElementoComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<void>();
  @Input() mostrar = false;
  @Input() elemento: any = null;
  @Input() tipos: any[] = [];
  @Input() estados: any[] = [];
  @Input() ubicaciones: any[] = [];

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  editando = false;
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';
  formulario: any = {};

  mostrarModalUbicacion = false;
  nuevaUbicacionNombre = '';

  ngOnInit(): void {}

  abrirEdicion(): void {
    this.editando = true;
    this.formulario = { ...this.elemento };
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.mensaje = '';
  }

  guardarCambios(): void {
    if (!this.formulario.nombre_elemento || !this.formulario.cod_tipo_elemento || !this.formulario.cod_ubi_elemento || !this.formulario.cod_estado_elemento) {
      this.mensaje = 'Por favor completa los campos obligatorios (*)';
      this.tipoMensaje = 'error';
      return;
    }
    this.cargando = true;
    this.inventarioService.actualizarElemento(this.elemento.id_elemento, this.formulario).subscribe({
      next: (response: any) => {
        if (response.success !== false) {
          this.mensaje = 'Elemento actualizado exitosamente';
          this.tipoMensaje = 'success';
          this.actualizado.emit();
          setTimeout(() => {
            this.cerrarModal();
          }, 1500);
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al actualizar:', err);
        this.mensaje = 'Error al actualizar el elemento';
        this.tipoMensaje = 'error';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalUbicacion(): void {
    this.nuevaUbicacionNombre = '';
    this.mostrarModalUbicacion = true;
  }

  cerrarModalUbicacion(): void {
    this.mostrarModalUbicacion = false;
    this.nuevaUbicacionNombre = '';
    this.cdr.detectChanges();
  }

  guardarNuevaUbicacion(): void {
    if (!this.nuevaUbicacionNombre || !this.nuevaUbicacionNombre.trim()) {
      this.mensaje = 'El nombre de la ubicación es requerido';
      this.tipoMensaje = 'error';
      this.cdr.detectChanges();
      return;
    }

    this.inventarioService.crearUbicacion({ ubicacion: this.nuevaUbicacionNombre.trim() }).subscribe({
      next: (response: any) => {
        this.mensaje = 'Ubicación guardada exitosamente';
        this.tipoMensaje = 'success';

        this.inventarioService.obtenerOpciones().subscribe({
          next: (res: any) => {
            if (res) {
              const data = res.success !== undefined ? res : res;
              this.ubicaciones = data.ubicaciones || data;
            }

            const nuevoId = response?.ubicacion?.cod_ubi_elemento || response?.cod_ubi_elemento || response?.id;
            if (nuevoId) {
              this.formulario.cod_ubi_elemento = nuevoId;
            }

            this.cerrarModalUbicacion();
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        console.error('Error al crear ubicación:', err);
        this.mensaje = err.error?.mensaje || 'Error al guardar la ubicación en la base de datos';
        this.tipoMensaje = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  eliminarUbicacion(idUbicacion: number): void {
    if (!idUbicacion) {
      this.mensaje = 'Selecciona una ubicación para eliminar';
      this.tipoMensaje = 'error';
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta ubicación?')) {
      return;
    }

    this.inventarioService.eliminarUbicacion(idUbicacion).subscribe({
      next: (response: any) => {
        this.mensaje = 'Ubicación eliminada exitosamente';
        this.tipoMensaje = 'success';
        this.formulario.cod_ubi_elemento = '';
        this.inventarioService.obtenerOpciones().subscribe({
          next: (res: any) => {
            if (res) {
              const data = res.success !== undefined ? res : res;
              this.ubicaciones = data.ubicaciones || data;
            }
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        console.error('Error al eliminar ubicación:', err);
        this.mensaje = err.error?.mensaje || 'No se puede eliminar la ubicación porque está en uso';
        this.tipoMensaje = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  obtenerNombreTipo(cod: any): string {
    const tipo = this.tipos.find(t => t.cod_tipo_elemento == cod);
    return tipo ? tipo.tipo : 'N/A';
  }

  obtenerNombreEstado(cod: any): string {
    const estado = this.estados.find(e => e.cod_estado_elemento == cod);
    return estado ? estado.estado : 'N/A';
  }

  obtenerClaseEstado(cod: any): string {
    const estadoMap: { [key: number]: string } = {
      1: 'estado-activo',
      2: 'estado-inactivo',
      3: 'estado-danado',
      4: 'estado-pendiente'
    };
    return estadoMap[cod] || 'estado-inactivo';
  }

  obtenerNombreUbicacion(cod: any): string {
    const ubicacion = this.ubicaciones.find(u => u.cod_ubi_elemento == cod);
    return ubicacion ? ubicacion.ubicacion : 'N/A';
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}