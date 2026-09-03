import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamoActivo, PrestamosActivosService } from '../../services/prestamos-activos.service';

@Component({
  selector: 'app-modal-detalles-prestamo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="cerrar()">
      <div class="modal-content-detalles" (click)="$event.stopPropagation()">
        
        <!-- HEADER -->
        <div class="modal-header-detalles">
          <h2>Detalles del Préstamo #{{ prestamo?.id_reserva }}</h2>
          <button class="btn-cerrar-modal" (click)="cerrar()">✕</button>
        </div>

        <!-- CARGANDO -->
        <div *ngIf="cargando" class="modal-body">
          <p class="text-center">⏳ Cargando detalles...</p>
        </div>

        <!-- CONTENIDO -->
        <div *ngIf="!cargando && prestamo" class="modal-body-detalles">
          
          <!-- INFORMACIÓN GENERAL -->
          <div class="seccion-detalles">
            <h3>Información General</h3>
            <div class="grid-detalles">
              <div class="campo-detalle">
                <label>ID Reserva:</label>
                <span>#{{ prestamo.id_reserva }}</span>
              </div>
              <div class="campo-detalle">
                <label>Documento Usuario:</label>
                <span>{{ prestamo.documento }}</span>
              </div>
              <div class="campo-detalle">
                <label>Nombre Usuario:</label>
                <span>{{ prestamo.nombre }}</span>
              </div>
              <div class="campo-detalle">
                <label>Elemento:</label>
                <span>{{ prestamo.elemento }}</span>
              </div>
              <div class="campo-detalle">
                <label>Tipo:</label>
                <span>{{ prestamo.tipo }}</span>
              </div>
              <div class="campo-detalle">
                <label>Cantidad:</label>
                <span>{{ prestamo.cantidad }}</span>
              </div>
              <div class="campo-detalle">
                <label>Fecha Inicio:</label>
                <span>{{ prestamo.fecha_inicio | date: 'medium' }}</span>
              </div>
              <div class="campo-detalle">
                <label>Fecha Entrega:</label>
                <span>{{ prestamo.fecha_entrega ? (prestamo.fecha_entrega | date: 'medium') : 'Pendiente' }}</span>
              </div>
            </div>
          </div>

          <!-- ESTADO ACTUAL -->
          <div class="seccion-detalles">
            <h3>Estado Actual</h3>
            <div class="estado-actual">
              <span class="estado-badge" [ngClass]="'estado-' + obtenerClaseEstado(prestamo.cod_estado_prestamo)">
                {{ obtenerNombreEstado(prestamo.cod_estado_prestamo) }}
              </span>
            </div>
          </div>

          <!-- ESTADO DE ELEMENTOS -->
          <div class="seccion-detalles" *ngIf="prestamo.estado_elementos && prestamo.estado_elementos.length > 0">
            <h3>Estado de Elementos</h3>
            <table class="tabla-estados-elementos">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let est of prestamo.estado_elementos">
                  <td>{{ est.estado }}</td>
                  <td>{{ est.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CAMBIAR ESTADO -->
          <div class="seccion-detalles">
            <h3>Actualizar Estado</h3>
            <div class="cambio-estado">
              <div class="campo-formulario">
                <label for="nuevoEstado">Nuevo Estado:</label>
                <select 
                  id="nuevoEstado" 
                  [(ngModel)]="nuevoEstado" 
                  class="input-formulario"
                  [disabled]="actualizando"
                >
                  <option [value]="null">Seleccionar estado...</option>
                  <option *ngFor="let est of estadosDisponibles" [value]="est.cod">
                    {{ est.nombre }}
                  </option>
                </select>
              </div>

              <div class="campo-formulario">
                <label for="observaciones">Observaciones:</label>
                <textarea 
                  id="observaciones" 
                  [(ngModel)]="observaciones"
                  placeholder="Agregar observaciones (opcional)"
                  class="textarea-formulario"
                  [disabled]="actualizando"
                ></textarea>
              </div>

              <div *ngIf="mensajeError" class="mensaje-error">
                {{ mensajeError }}
              </div>

              <div *ngIf="mensajeExito" class="mensaje-exito">
                {{ mensajeExito }}
              </div>
            </div>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="modal-footer-detalles">
          <button class="btn-cancelar" (click)="cerrar()" [disabled]="actualizando">
            Cancelar
          </button>
          <button 
            class="btn-guardar" 
            (click)="guardarCambios()"
            [disabled]="!nuevoEstado || actualizando"
          >
            {{ actualizando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content-detalles {
      background: white;
      border-radius: 8px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .modal-header-detalles {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 2px solid #1C74A0;
      background: #f8f9fa;
    }

    .modal-header-detalles h2 {
      margin: 0;
      color: #1C74A0;
      font-size: 20px;
    }

    .btn-cerrar-modal {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      transition: color 0.2s;
    }

    .btn-cerrar-modal:hover {
      color: #333;
    }

    .modal-body-detalles {
      padding: 20px;
    }

    .seccion-detalles {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .seccion-detalles h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }

    .grid-detalles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .campo-detalle {
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }

    .campo-detalle label {
      display: block;
      font-weight: 600;
      color: #666;
      margin-bottom: 5px;
      font-size: 12px;
    }

    .campo-detalle span {
      display: block;
      color: #333;
      font-size: 14px;
    }

    .estado-actual {
      display: flex;
      gap: 10px;
    }

    .estado-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .estado-solicitado {
      background-color: #fff3cd;
      color: #856404;
    }

    .estado-entregado {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .estado-devuelto {
      background-color: #d4edda;
      color: #155724;
    }

    .estado-perdido {
      background-color: #f8d7da;
      color: #721c24;
    }

    .estado-danado {
      background-color: #f8d7da;
      color: #721c24;
    }

    .tabla-estados-elementos {
      width: 100%;
      border-collapse: collapse;
      background: #f9f9f9;
    }

    .tabla-estados-elementos th {
      background: #1C74A0;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: 600;
    }

    .tabla-estados-elementos td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
    }

    .cambio-estado {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }

    .campo-formulario {
      margin-bottom: 15px;
    }

    .campo-formulario label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .input-formulario,
    .textarea-formulario {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
    }

    .input-formulario:focus,
    .textarea-formulario:focus {
      outline: none;
      border-color: #1C74A0;
      box-shadow: 0 0 5px rgba(28, 116, 160, 0.2);
    }

    .textarea-formulario {
      resize: vertical;
      min-height: 80px;
    }

    .input-formulario:disabled,
    .textarea-formulario:disabled {
      background: #e9ecef;
      cursor: not-allowed;
    }

    .mensaje-error,
    .mensaje-exito {
      margin-top: 10px;
      padding: 10px;
      border-radius: 6px;
      font-size: 14px;
    }

    .mensaje-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .mensaje-exito {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .modal-footer-detalles {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .btn-cancelar,
    .btn-guardar {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-cancelar {
      background: #6c757d;
      color: white;
    }

    .btn-cancelar:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn-guardar {
      background: #1C74A0;
      color: white;
    }

    .btn-guardar:hover:not(:disabled) {
      background: #155b7f;
    }

    .btn-cancelar:disabled,
    .btn-guardar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .text-center {
      text-align: center;
    }

    /* DARK MODE */
    :host-context(body.dark-mode) .modal-content-detalles {
      background: #1e1e1e;
      color: #e0e0e0;
    }

    :host-context(body.dark-mode) .modal-header-detalles {
      background: #2a2a2a;
      border-bottom-color: #FF9F13;
    }

    :host-context(body.dark-mode) .modal-header-detalles h2 {
      color: #FF9F13;
    }

    :host-context(body.dark-mode) .seccion-detalles {
      border-bottom-color: #333;
    }

    :host-context(body.dark-mode) .campo-detalle {
      background: #2a2a2a;
      border-color: #444;
    }

    :host-context(body.dark-mode) .campo-detalle label {
      color: #999;
    }

    :host-context(body.dark-mode) .campo-detalle span {
      color: #e0e0e0;
    }

    :host-context(body.dark-mode) .cambio-estado {
      background: #2a2a2a;
      border-color: #444;
    }

    :host-context(body.dark-mode) .input-formulario,
    :host-context(body.dark-mode) .textarea-formulario {
      background: #333;
      border-color: #444;
      color: #e0e0e0;
    }

    :host-context(body.dark-mode) .btn-guardar {
      background: #FF9F13;
      color: #000;
    }

    :host-context(body.dark-mode) .btn-guardar:hover:not(:disabled) {
      background: #e08b0f;
    }

    :host-context(body.dark-mode) .modal-footer-detalles {
      background: #2a2a2a;
      border-top-color: #333;
    }
  `]
})
export class ModalDetallesPrestamo implements OnInit {
  @Input() prestamo: PrestamoActivo | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() actualizarPrestamo = new EventEmitter<{ idReserva: number; nuevoEstado: number; observaciones: string }>();

  private prestamosService = inject(PrestamosActivosService);

  cargando = false;
  actualizando = false;
  nuevoEstado: number | null = null;
  observaciones = '';
  mensajeError = '';
  mensajeExito = '';

  estadosDisponibles = [
    { cod: 1, nombre: 'Solicitado' },
    { cod: 2, nombre: 'Entregado' },
    { cod: 3, nombre: 'Devuelto' },
    { cod: 4, nombre: 'Perdido' },
    { cod: 5, nombre: 'Dañado' }
  ];

  ngOnInit(): void {
    // Modal listo al inicializar
  }

  /**
   * Obtener nombre del estado
   */
  obtenerNombreEstado(cod: number): string {
    const estado = this.estadosDisponibles.find(e => e.cod === cod);
    return estado ? estado.nombre : 'Desconocido';
  }

  /**
   * Obtener clase CSS del estado
   */
  obtenerClaseEstado(cod: number): string {
    const clases: { [key: number]: string } = {
      1: 'solicitado',
      2: 'entregado',
      3: 'devuelto',
      4: 'perdido',
      5: 'danado'
    };
    return clases[cod] || '';
  }

  /**
   * Guardar cambios
   */
  guardarCambios(): void {
    if (!this.nuevoEstado || !this.prestamo) return;

    this.mensajeError = '';
    this.mensajeExito = '';
    this.actualizando = true;

    this.prestamosService
      .actualizarEstadoPrestamo(
        this.prestamo.id_reserva,
        this.nuevoEstado,
        this.observaciones
      )
      .subscribe({
        next: (response) => {
          this.actualizando = false;
          this.mensajeExito = '✓ Estado actualizado correctamente';

          // Emitir evento para que el padre recargue la lista
          this.actualizarPrestamo.emit({
            idReserva: this.prestamo!.id_reserva,
            nuevoEstado: this.nuevoEstado!,
            observaciones: this.observaciones
          });

          // Cerrar modal después de 1.5s
          setTimeout(() => this.cerrar(), 1500);
        },
        error: (error) => {
          this.actualizando = false;
          this.mensajeError = error.error?.mensaje || 'Error al actualizar el estado. Intenta nuevamente.';
          console.error('Error actualizando estado:', error);
        }
      });
  }

  /**
   * Cerrar modal
   */
  cerrar(): void {
    this.cerrarModal.emit();
  }
}