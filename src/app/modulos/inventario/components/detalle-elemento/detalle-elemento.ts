import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { HistorialMantenimientoComponent } from '../historial-mantenimiento/historial-mantenimiento';
import { HistorialMovimientosComponent } from '../historial-movimientos/historial-movimientos';
import { SelectorPadreComponent } from '../selector-padre/selector-padre';
import { claseEstadoElemento } from '../../inventario.constants';
import { extraerMensajeError } from '../../../shared/utils/api-error.helper';
import { SelectorMarcaComponent } from '../selector-marca/selector-marca';

@Component({
  selector: 'app-detalle-elemento',
  standalone: true,
  imports: [CommonModule, FormsModule, HistorialMantenimientoComponent, HistorialMovimientosComponent, SelectorPadreComponent, SelectorMarcaComponent],
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

  cargandoDetalle = false;
  parcial = false;

  private pila: any[] = [];

  mostrarModalUbicacion = false;
  nuevaUbicacionNombre = '';
  mostrarModalTipo = false;
  editandoTipo = false;
  nuevoTipoNombre = '';
  tipoIdAEditar: number | null = null;
  mostrarHistorial = false;
  mostrarMovimientos = false;

  ngOnInit(): void {
    if (this.tipoTab !== 'activos' || !this.elemento?.id_elemento) return;

    this.parcial = this.esParcial(this.elemento);
    this.cargarDetalle(this.elemento.id_elemento);
  }

  // --- CARGA Y NAVEGACIÓN ---
  private esParcial(elemento: any): boolean {
    return !!elemento && elemento.cod_tipo_elemento === undefined;
  }

  private cargarDetalle(id: number): void {
    this.cargandoDetalle = true;
    this.cdr.detectChanges();

    this.inventarioService.obtenerElemento(id).subscribe({
      next: (res: any) => {
        if (this.elemento?.id_elemento !== id) return;

        this.elemento = res?.data || res;
        this.parcial = false;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: () => {
        if (this.elemento?.id_elemento !== id) return;

        this.parcial = false;
        this.cargandoDetalle = false;
        this.mensaje = 'No se pudo cargar el detalle completo del elemento';
        this.tipoMensaje = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  get puedeVolver(): boolean {
    return this.pila.length > 0;
  }

  get etiquetaAnterior(): string {
    const anterior = this.pila[this.pila.length - 1];
    return anterior ? (anterior.cod_elemento || ('#' + anterior.id_elemento)) : '';
  }

  verRelacionado(relacionado: any): void {
    if (!relacionado?.id_elemento || relacionado.id_elemento === this.elemento?.id_elemento) return;

    this.pila.push(this.elemento);
    this.editando = false;
    this.mensaje = '';
    this.elemento = { ...relacionado };
    this.parcial = this.esParcial(this.elemento);
    this.cargarDetalle(relacionado.id_elemento);
  }

  volver(): void {
    const anterior = this.pila.pop();
    if (!anterior) return;

    this.editando = false;
    this.mensaje = '';
    this.elemento = anterior;
    this.parcial = this.esParcial(anterior);
    this.cargarDetalle(anterior.id_elemento);
  }

  // --- EDICIÓN ---
  abrirEdicion(): void {
    if (this.cargandoDetalle) return;
    this.editando = true;
    this.formulario = { ...this.elemento };
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.mensaje = '';
  }

  guardarCambios(): void {
    if (this.tipoTab === 'activos') {
      if (!this.formulario.nombre_elemento || !this.formulario.cod_tipo_elemento || !this.formulario.cod_ubi_elemento) {
        this.mensaje = 'Por favor completa los campos obligatorios (*)';
        this.tipoMensaje = 'error';
        return;
      }
      this.cargando = true;

      const datos = {
        cod_elemento: this.formulario.cod_elemento || null,
        nombre_elemento: this.formulario.nombre_elemento,
        cod_tipo_elemento: this.formulario.cod_tipo_elemento,
        cod_ubi_elemento: this.formulario.cod_ubi_elemento,
        cod_marca: this.formulario.cod_marca || null,
        serial: this.formulario.serial || null,
        modelo: this.formulario.modelo || null,
        descripcion: this.formulario.descripcion || null,
        id_elemento_padre: this.formulario.id_elemento_padre || null
      };

      this.inventarioService.actualizarElemento(this.elemento.id_elemento, datos).subscribe({
        next: (response: any) => {
          if (response.success !== false) {
            this.finalizarGuardado('Elemento actualizado exitosamente');
          }
        },
        error: (err: any) => {
          this.mensaje = extraerMensajeError(err, 'Error al actualizar el elemento');
          this.tipoMensaje = 'error';
          this.cargando = false;
          this.cdr.detectChanges();
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
        cod_marca: this.formulario.cod_marca || null,
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
          this.mensaje = extraerMensajeError(err, 'Error al actualizar el accesorio');
          this.tipoMensaje = 'error';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  finalizarGuardado(mensajeExito: string): void {
    this.mensaje = mensajeExito;
    this.tipoMensaje = 'success';
    this.actualizado.emit();
    this.cargando = false;
    this.cdr.detectChanges();
    setTimeout(() => this.cerrarModal(), 1500);
  }

  abrirModalUbicacion(): void {
    this.nuevaUbicacionNombre = ''; this.mostrarModalUbicacion = true;
  }
  cerrarModalUbicacion(): void {
    this.mostrarModalUbicacion = false; this.nuevaUbicacionNombre = '';
  }
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

  // --- MODALES HIJOS ---
  abrirHistorial(): void {
    this.mostrarHistorial = true; this.cdr.detectChanges();
  }
  cerrarHistorial(): void {
    this.mostrarHistorial = false; this.cdr.detectChanges();
  }
  abrirMovimientos(): void {
    this.mostrarMovimientos = true; this.cdr.detectChanges();
  }
  cerrarMovimientos(): void {
    this.mostrarMovimientos = false; this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.pila = [];
    this.cerrar.emit();
  }

  // --- HELPERS VISUALES ---
  obtenerNombreTipo(cod: any): string {
    return this.tipos.find(t => t.cod_tipo_elemento == cod)?.tipo || 'N/A';
  }
  obtenerNombreEstado(cod: any): string {
    return this.estados.find(e => e.cod_estado_elemento == cod)?.estado || 'N/A';
  }
  obtenerClaseEstado(cod: any): string {
    return claseEstadoElemento(cod);
  }
  obtenerNombreUbicacion(cod: any): string {
    return this.ubicaciones.find(u => u.cod_ubi_elemento == cod)?.ubicacion || 'N/A';
  }
}