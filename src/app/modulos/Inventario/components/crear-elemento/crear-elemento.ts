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

  nombre_elemento = '';
  cod_tipo_elemento = '';
  cod_ubi_elemento = '';
  cod_estado_elemento = '1';
  serial = '';
  modelo = '';
  descripcion = '';
  
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
  ) {}

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

  guardar(): void {
    if (!this.validar()) {
      return;
    }
    this.cargando = true;
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
          setTimeout(() => {
            this.cerrarModal();
          }, 1500);
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
  }

  validar(): boolean {
    if (!this.nombre_elemento.trim()) {
      this.mensaje = 'El nombre del elemento es requerido';
      this.tipoMensaje = 'error';
      return false;
    }
    if (!this.cod_tipo_elemento) {
      this.mensaje = 'Debes seleccionar un tipo de elemento';
      this.tipoMensaje = 'error';
      return false;
    }
    if (!this.cod_ubi_elemento) {
      this.mensaje = 'Debes seleccionar una ubicación';
      this.tipoMensaje = 'error';
      return false;
    }
    return true;
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
              this.tipos = data.tipos || [];
              this.ubicaciones = data.ubicaciones || data;
              this.estados = data.estados || [];
            }

            const nuevoId = response?.ubicacion?.cod_ubi_elemento || response?.cod_ubi_elemento || response?.id;
            if (nuevoId) {
              this.cod_ubi_elemento = nuevoId;
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

  abrirModalTipo(): void {
    this.nuevoTipoNombre = '';
    this.mostrarModalTipo = true;
  }

  cerrarModalTipo(): void {
    this.mostrarModalTipo = false;
    this.nuevoTipoNombre = '';
    this.cdr.detectChanges();
  }

  guardarNuevoTipo(): void {
    if (!this.nuevoTipoNombre || !this.nuevoTipoNombre.trim()) {
      this.mensaje = 'El nombre del tipo es requerido';
      this.tipoMensaje = 'error';
      this.cdr.detectChanges();
      return;
    }

    this.inventarioService.crearTipo({ tipo: this.nuevoTipoNombre.trim() }).subscribe({
      next: (response: any) => {
        this.mensaje = 'Tipo de elemento guardado exitosamente';
        this.tipoMensaje = 'success';
        
        this.inventarioService.obtenerOpciones().subscribe({
          next: (res: any) => {
            if (res) {
              const data = res.success !== undefined ? res : res;
              this.tipos = data.tipos || [];
            }
            const nuevoId = response?.tipo?.cod_tipo_elemento || response?.cod_tipo_elemento || response?.id;
            if (nuevoId) {
              this.cod_tipo_elemento = nuevoId;
            }
            this.cerrarModalTipo();
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        console.error('Error al crear tipo:', err);
        this.mensaje = err.error?.mensaje || 'Error al guardar el tipo en la base de datos';
        this.tipoMensaje = 'error';
        this.cdr.detectChanges();
      }
    });
  }

  eliminarTipo(idTipo: number): void {
    if (!idTipo) {
      this.mensaje = 'Selecciona un tipo de elemento en la lista para eliminar';
      this.tipoMensaje = 'error';
      return;
    }
    
    const tipoObj = this.tipos.find(t => t.cod_tipo_elemento == idTipo);
    const nombreTipo = tipoObj ? tipoObj.tipo : 'este tipo';

    if (!confirm(`¿Estás seguro de que deseas eliminar el tipo de elemento "${nombreTipo}"?`)) {
      return;
    }

    this.inventarioService.eliminarTipo(idTipo).subscribe({
      next: (response: any) => {
        this.mensaje = 'Tipo eliminado exitosamente';
        this.tipoMensaje = 'success';
        this.cod_tipo_elemento = ''; 
        this.cargarOpciones(); 
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al eliminar tipo:', err);
        this.mensaje = err.error?.mensaje || 'No se puede eliminar el tipo porque hay equipos vinculados a él';
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

    const ubiObj = this.ubicaciones.find(u => u.cod_ubi_elemento == idUbicacion);
    const nombreUbi = ubiObj ? ubiObj.ubicacion : 'esta ubicación';

    if (!confirm(`¿Estás seguro de que deseas eliminar la ubicación "${nombreUbi}"?`)) {
      return;
    }

    this.inventarioService.eliminarUbicacion(idUbicacion).subscribe({
      next: (response: any) => {
        this.mensaje = 'Ubicación eliminada exitosamente';
        this.tipoMensaje = 'success';
        this.cod_ubi_elemento = '';
        this.cargarOpciones();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al eliminar ubicación:', err);
        this.mensaje = err.error?.mensaje || 'No se puede eliminar la ubicación porque está en uso';
        this.tipoMensaje = 'error';
        this.cdr.detectChanges();
      }
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
    this.mensaje = '';
  }

  cerrarModal(): void {
    this.limpiar();
    this.cerrar.emit();
  }
}