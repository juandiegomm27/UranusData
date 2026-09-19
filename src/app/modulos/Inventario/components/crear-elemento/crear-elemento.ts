import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-crear-elemento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-elemento.html',
  styleUrls: ['./crear-elemento.css']
})
export class CrearElementoComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();
  @Input() mostrar = false;
  @Input() tipoTab: 'activos' | 'accesorios' = 'activos';

  nombre_elemento = '';
  cod_tipo_elemento = '';
  cod_ubi_elemento = '';
  cod_estado_elemento = '1';
  serial = '';
  modelo = '';
  descripcion = '';
  cantidad_total = 1;

  sugerenciasAccesorios: any[] = [];
  accesorioSeleccionado: any = null;

  tipos: any[] = [];
  ubicaciones: any[] = [];
  estados: any[] = [];

  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  mostrarModalUbicacion = false;
  nuevaUbicacionNombre = '';
  mostrarModalTipo = false;
  nuevoTipoNombre = '';
  cod_elemento = '';

  constructor(
    private inventarioService: InventarioService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarOpciones();
  }

  cargarOpciones(): void {
    this.inventarioService.obtenerOpciones().subscribe({
      next: (response: any) => {
        if (response) {
          const data = response.success !== undefined ? response : response;
          this.tipos = data.tipos || [];
          this.ubicaciones = data.ubicaciones || [];
          this.estados = data.estados || [];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar opciones:', err);
      }
    });
  }

  buscarSugerenciasAccesorios(): void {
    if (this.tipoTab !== 'accesorios') return;

    if (this.accesorioSeleccionado && this.accesorioSeleccionado.nombre !== this.nombre_elemento) {
      this.accesorioSeleccionado = null;
    }

    if (!this.nombre_elemento || this.nombre_elemento.trim().length < 2) {
      this.sugerenciasAccesorios = [];
      this.cdr.detectChanges();
      return;
    }

    this.inventarioService.obtenerAccesorios(1, 5, this.nombre_elemento).subscribe({
      next: (response: any) => {
        this.sugerenciasAccesorios = response.data || response || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al buscar sugerencias de accesorios:', err);
        this.sugerenciasAccesorios = [];
      }
    });
  }

  seleccionarAccesorio(acc: any): void {
    this.accesorioSeleccionado = acc;
    this.nombre_elemento = acc.nombre;

    // Obligamos al usuario a seleccionar una nueva ubicación para este nuevo stock
    this.cod_ubi_elemento = '';

    if (acc.cod_tipo_elemento) {
      this.cod_tipo_elemento = acc.cod_tipo_elemento;
    }
    this.descripcion = acc.descripcion || '';
    this.sugerenciasAccesorios = [];
    this.cdr.detectChanges();
  }

  guardar(): void {
    if (!this.validar()) {
      return;
    }
    this.cargando = true;

    if (this.tipoTab === 'activos') {
      const datos = {
        cod_elemento: this.cod_elemento || null,
        nombre_elemento: this.nombre_elemento,
        cod_tipo_elemento: this.cod_tipo_elemento,
        cod_ubi_elemento: this.cod_ubi_elemento,
        cod_estado_elemento: this.cod_estado_elemento,
        serial: this.serial || null,
        modelo: this.modelo || null,
        descripcion: this.descripcion || null
      };

      this.inventarioService.crearElemento(datos).subscribe({
        next: (response: any) => {
          if (response.success !== false) {
            this.mensaje = 'Elemento creado exitosamente';
            this.tipoMensaje = 'success';
            this.guardado.emit();
            setTimeout(() => { this.cerrarModal(); }, 1500);
          }
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error al crear:', err);
          this.mensaje = err.error?.mensaje || 'Error al crear el elemento';
          this.tipoMensaje = 'error';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // TRAYECTO DE ACCESORIOS (NUEVO STOCK)
      // Si `this.accesorioSeleccionado` existe, enviamos su `id_accesorio`. 
      // El backend entenderá que debe agregar el stock a ese ID en lugar de crear un duplicado global.
      const datosAccesorio = {
        id_accesorio: this.accesorioSeleccionado ? this.accesorioSeleccionado.id_accesorio : null,
        nombre: this.nombre_elemento,
        cod_tipo_elemento: this.cod_tipo_elemento || null,
        descripcion: this.descripcion || null,
        cantidad_total: this.cantidad_total,
        cantidad_disponible: this.cantidad_total,
        cod_ubi_elemento: this.cod_ubi_elemento
      };

      this.inventarioService.crearAccesorio(datosAccesorio).subscribe({
        next: (response: any) => {
          if (response.success !== false) {
            this.mensaje = this.accesorioSeleccionado
              ? `Stock añadido exitosamente (+${this.cantidad_total} unidades)`
              : 'Accesorio creado exitosamente';
            this.tipoMensaje = 'success';
            this.guardado.emit();
            setTimeout(() => { this.cerrarModal(); }, 1500);
          }
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error al guardar accesorio:', err);
          this.mensaje = err.error?.mensaje || 'Error al procesar el accesorio';
          this.tipoMensaje = 'error';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  validar(): boolean {
    if (!this.nombre_elemento.trim()) {
      this.mensaje = 'El nombre es requerido';
      this.tipoMensaje = 'error';
      return false;
    }
    if (!this.cod_tipo_elemento) {
      this.mensaje = 'Debes seleccionar un tipo';
      this.tipoMensaje = 'error';
      return false;
    }
    if (!this.cod_ubi_elemento) {
      this.mensaje = 'Debes seleccionar una ubicación';
      this.tipoMensaje = 'error';
      return false;
    }
    if (this.tipoTab === 'accesorios' && this.cantidad_total < 1) {
      this.mensaje = 'La cantidad inicial debe ser al menos 1';
      this.tipoMensaje = 'error';
      return false;
    }
    return true;
  }

  abrirModalUbicacion(): void { this.nuevaUbicacionNombre = ''; this.mostrarModalUbicacion = true; }
  cerrarModalUbicacion(): void { this.mostrarModalUbicacion = false; this.nuevaUbicacionNombre = ''; this.cdr.detectChanges(); }
  guardarNuevaUbicacion(): void {
    if (!this.nuevaUbicacionNombre || !this.nuevaUbicacionNombre.trim()) return;
    this.inventarioService.crearUbicacion({ ubicacion: this.nuevaUbicacionNombre.trim() }).subscribe({
      next: (response: any) => {
        this.inventarioService.obtenerOpciones().subscribe({
          next: (res: any) => {
            const data = res.success !== undefined ? res : res;
            this.ubicaciones = data.ubicaciones || data;
            const nuevoId = response?.ubicacion?.cod_ubi_elemento || response?.cod_ubi_elemento || response?.id;
            if (nuevoId) this.cod_ubi_elemento = nuevoId;
            this.cerrarModalUbicacion();
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  abrirModalTipo(): void { this.nuevoTipoNombre = ''; this.mostrarModalTipo = true; }
  cerrarModalTipo(): void { this.mostrarModalTipo = false; this.nuevoTipoNombre = ''; this.cdr.detectChanges(); }
  guardarNuevoTipo(): void {
    if (!this.nuevoTipoNombre || !this.nuevoTipoNombre.trim()) return;
    this.inventarioService.crearTipo({ tipo: this.nuevoTipoNombre.trim() }).subscribe({
      next: (response: any) => {
        this.inventarioService.obtenerOpciones().subscribe({
          next: (res: any) => {
            const data = res.success !== undefined ? res : res;
            this.tipos = data.tipos || [];
            const nuevoId = response?.tipo?.cod_tipo_elemento || response?.cod_tipo_elemento || response?.id;
            if (nuevoId) this.cod_tipo_elemento = nuevoId;
            this.cerrarModalTipo();
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  eliminarTipo(idTipo: number): void {
    if (!idTipo) return;
    if (!confirm('¿Estás seguro de eliminar este tipo?')) return;
    this.inventarioService.eliminarTipo(idTipo).subscribe({
      next: () => { this.cod_tipo_elemento = ''; this.cargarOpciones(); this.cdr.detectChanges(); }
    });
  }

  eliminarUbicacion(idUbicacion: number): void {
    if (!idUbicacion) return;
    if (!confirm('¿Estás seguro de eliminar esta ubicación?')) return;
    this.inventarioService.eliminarUbicacion(idUbicacion).subscribe({
      next: () => { this.cod_ubi_elemento = ''; this.cargarOpciones(); this.cdr.detectChanges(); }
    });
  }

  limpiar(): void {
    this.cod_elemento = '';
    this.nombre_elemento = '';
    this.cod_tipo_elemento = '';
    this.cod_ubi_elemento = '';
    this.cod_estado_elemento = '1';
    this.serial = '';
    this.modelo = '';
    this.descripcion = '';
    this.cantidad_total = 1;
    this.sugerenciasAccesorios = [];
    this.accesorioSeleccionado = null;
    this.mensaje = '';
  }

  cerrarModal(): void {
    this.limpiar();
    this.cerrar.emit();
  }
}