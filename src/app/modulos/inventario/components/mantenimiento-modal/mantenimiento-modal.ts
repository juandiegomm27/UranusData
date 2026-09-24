import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-mantenimiento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimiento-modal.html',
  styleUrls: ['./mantenimiento-modal.css']
})
export class MantenimientoModalComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() enviado = new EventEmitter<void>(); // Evento para recargar la tabla principal
  @Input() mostrar = false;
  @Input() elemento: any = null;

  cod_tipo_mantenimiento = '';
  descripcion = '';
  documento_tecnico = '';
  observaciones = '';
  
  tiposMantenimiento: any[] = [];
  tecnicos: any[] = [];
  
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  // Inyectar el detector de cambios
  private cdr = inject(ChangeDetectorRef);

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarOpciones();
  }

  cargarOpciones(): void {
    this.inventarioService.obtenerOpciones().subscribe({
      next: (response: any) => {
        if (response) {
          // Manejo robusto de la respuesta del backend
          const data = response.success !== undefined ? response : response;
          this.tiposMantenimiento = data.tipos_mantenimiento || [];
        }
        // Forzar actualización visual
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error al cargar opciones:', err);
      }
    });
  }

  enviarMantenimiento(): void {
    if (!this.validar()) return;
    this.cargando = true;
    
    const datos = {
      cod_tipo_mantenimiento: this.cod_tipo_mantenimiento,
      descripcion: this.descripcion
    };

    this.inventarioService.enviarMantenimiento(this.elemento.id_elemento, datos).subscribe({
      next: (response: any) => {
        if (response.success !== false) {
          this.mensaje = 'Elemento enviado a mantenimiento exitosamente';
          this.tipoMensaje = 'success';
          this.enviado.emit(); 
          
          setTimeout(() => {
            this.cerrarModal();
          }, 1500);
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al enviar a mantenimiento:', err);
        this.mensaje = err.error?.mensaje || 'Error al enviar a mantenimiento';
        this.tipoMensaje = 'error';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  validar(): boolean {
    if (!this.cod_tipo_mantenimiento) {
      this.mensaje = 'Debes seleccionar un tipo de mantenimiento';
      this.tipoMensaje = 'error';
      this.cdr.detectChanges();
      return false;
    }
    if (!this.descripcion.trim()) {
      this.mensaje = 'La descripción del problema es requerida';
      this.tipoMensaje = 'error';
      this.cdr.detectChanges();
      return false;
    }
    return true;
  }

  limpiar(): void {
    this.cod_tipo_mantenimiento = '';
    this.descripcion = '';
    this.documento_tecnico = '';
    this.observaciones = '';
    this.mensaje = '';
  }

  cerrarModal(): void {
    this.limpiar();
    this.cerrar.emit();
  }
}