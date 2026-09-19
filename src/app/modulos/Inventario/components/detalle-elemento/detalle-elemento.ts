import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { HistorialMantenimientoComponent } from '../historial-mantenimiento/historial-mantenimiento';

@Component({
  selector: 'app-detalle-elemento',
  standalone: true,
  imports: [CommonModule, FormsModule, HistorialMantenimientoComponent],
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
  @Input() tipoTab: 'activos' | 'accesorios' = 'activos';

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  editando = false;
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';
  formulario: any = {};
  
  mostrarModalUbicacion = false;
  nuevaUbicacionNombre = '';
  mostrarModalTipo = false;
  editandoTipo = false;
  nuevoTipoNombre = '';
  tipoIdAEditar: number | null = null;
  mostrarHistorial = false;

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
    if (this.tipoTab === 'activos') {
      if (!this.formulario.nombre_elemento || !this.formulario.cod_tipo_elemento || !this.formulario.cod_ubi_elemento || !this.formulario.cod_estado_elemento) {
        this.mensaje = 'Por favor completa los campos obligatorios (*)';
        this.tipoMensaje = 'error';
        return;
      }
      this.cargando = true;
      const seEnvioAMantenimiento = (this.formulario.cod_estado_elemento == 4 && this.elemento.cod_estado_elemento != 4);
      
      this.inventarioService.actualizarElemento(this.elemento.id_elemento, this.formulario).subscribe({
        next: (response: any) => {
          if (response.success !== false) {
            if (seEnvioAMantenimiento) {
              const datosAutomaticos = { cod_tipo_mantenimiento: 1, descripcion: 'Enviado a mantenimiento automáticamente por edición.' };
              this.inventarioService.enviarMantenimiento(this.elemento.id_elemento, datosAutomaticos).subscribe({
                next: () => this.finalizarGuardado('Elemento actualizado y enviado a mantenimiento.'),
                error: () => this.finalizarGuardado('Elemento actualizado (Error al enviar a mantenimiento).')
              });
            } else {
              this.finalizarGuardado('Elemento actualizado exitosamente');
            }
          }
        },
        error: () => {
          this.mensaje = 'Error al actualizar el elemento';
          this.tipoMensaje = 'error';
          this.cargando = false;
        }
      });
    } else {
      // --- VALIDACIONES DE ACCESORIOS (SOLO DATOS GLOBALES) ---
      if (!this.formulario.nombre) {
        this.mensaje = 'El nombre del accesorio es obligatorio';
        this.tipoMensaje = 'error';
        return;
      }
      this.cargando = true;
      
      const datosAccesorio = {
        nombre: this.formulario.nombre,
        cod_tipo_elemento: this.formulario.cod_tipo_elemento || null,
        descripcion: this.formulario.descripcion || null
      };

      this.inventarioService.actualizarAccesorio(this.elemento.id_accesorio, datosAccesorio).subscribe({
        next: (response: any) => {
          if (response.success !== false) {
            this.finalizarGuardado('Accesorio actualizado exitosamente');
          }
        },
        error: (err: any) => {
          console.error('Error al actualizar accesorio:', err);
          this.mensaje = err.error?.mensaje || 'Error al actualizar el accesorio';
          this.tipoMensaje = 'error';
          this.cargando = false;
        }
      });
    }
  }

  finalizarGuardado(mensajeExito: string): void {
    this.mensaje = mensajeExito;
    this.tipoMensaje = 'success';
    this.actualizado.emit();
    this.cargando = false;
    setTimeout(() => this.cerrarModal(), 1500);
  }

  abrirModalUbicacion(): void { this.nuevaUbicacionNombre = ''; this.mostrarModalUbicacion = true; }
  cerrarModalUbicacion(): void { this.mostrarModalUbicacion = false; this.nuevaUbicacionNombre = ''; }
  guardarNuevaUbicacion(): void {
    if (!this.nuevaUbicacionNombre) return;
    this.inventarioService.crearUbicacion({ ubicacion: this.nuevaUbicacionNombre.trim() }).subscribe({
      next: (res: any) => {
        this.formulario.cod_ubi_elemento = res?.ubicacion?.cod_ubi_elemento || res?.id;
        this.cerrarModalUbicacion();
        this.actualizado.emit(); 
      }
    });
  }
  eliminarUbicacion(id: number): void {
    if (!id || !confirm('¿Eliminar esta ubicación?')) return;
    this.inventarioService.eliminarUbicacion(id).subscribe({
      next: () => { this.formulario.cod_ubi_elemento = ''; this.actualizado.emit(); }
    });
  }
  
  abrirModalTipo(editar = false): void {
    this.editandoTipo = editar;
    if (editar) {
      this.tipoIdAEditar = this.formulario.cod_tipo_elemento;
      const tipoObj = this.tipos.find(t => t.cod_tipo_elemento == this.tipoIdAEditar);
      this.nuevoTipoNombre = tipoObj ? tipoObj.tipo : '';
    } else {
      this.tipoIdAEditar = null;
      this.nuevoTipoNombre = '';
    }
    this.mostrarModalTipo = true;
  }
  cerrarModalTipo(): void { this.mostrarModalTipo = false; this.nuevoTipoNombre = ''; }
  guardarTipo(): void {
    if (!this.nuevoTipoNombre) return;
    const peticion = this.editandoTipo
      ? this.inventarioService.actualizarTipo(this.tipoIdAEditar!, { tipo: this.nuevoTipoNombre.trim() })
      : this.inventarioService.crearTipo({ tipo: this.nuevoTipoNombre.trim() });
    peticion.subscribe({
      next: (res: any) => {
        if (!this.editandoTipo) this.formulario.cod_tipo_elemento = res?.data?.cod_tipo_elemento || res?.id;
        this.cerrarModalTipo();
        this.actualizado.emit();
      }
    });
  }
  eliminarTipo(id: number): void {
    if (!id || !confirm('¿Eliminar este tipo?')) return;
    this.inventarioService.eliminarTipo(id).subscribe({
      next: () => { this.formulario.cod_tipo_elemento = ''; this.actualizado.emit(); }
    });
  }

  abrirHistorial(): void { this.mostrarHistorial = true; this.cdr.detectChanges(); }
  cerrarHistorial(): void { this.mostrarHistorial = false; this.cdr.detectChanges(); }
  cerrarModal(): void { this.cerrar.emit(); }
  
  obtenerNombreTipo(cod: any): string { return this.tipos.find(t => t.cod_tipo_elemento == cod)?.tipo || 'N/A'; }
  obtenerNombreEstado(cod: any): string { return this.estados.find(e => e.cod_estado_elemento == cod)?.estado || 'N/A'; }
  obtenerClaseEstado(cod: any): string { return ({ 1: 'estado-activo', 2: 'estado-inactivo', 3: 'estado-danado', 4: 'estado-pendiente' } as Record<number, string>)[cod] || 'estado-inactivo'; }
  obtenerNombreUbicacion(cod: any): string { return this.ubicaciones.find(u => u.cod_ubi_elemento == cod)?.ubicacion || 'N/A'; }
}