import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { extraerMensajeError } from '../../../shared/utils/api-error.helper';

@Component({
  selector: 'app-selector-marca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-marca.html',
  styleUrls: ['./selector-marca.css']
})
export class SelectorMarcaComponent implements OnInit {
  @Input() valor: number | null = null;
  @Output() cambio = new EventEmitter<number | null>();
  @Output() catalogoCambio = new EventEmitter<void>();

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);

  marcas: any[] = [];
  mensaje = '';

  mostrarModal = false;
  nuevaMarca = '';
  mensajeModal = '';
  guardando = false;

  ngOnInit(): void {
    this.inventarioService.obtenerMarcas().subscribe({
      next: (res: any) => {
        this.marcas = res?.data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar las marcas';
        this.cdr.detectChanges();
      }
    });
  }

  seleccionar(valor: any): void {
    this.mensaje = '';
    this.cambio.emit(valor === '' || valor === undefined ? null : valor);
  }

  abrirModal(): void {
    this.nuevaMarca = '';
    this.mensajeModal = '';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.nuevaMarca = '';
    this.mensajeModal = '';
  }

  guardarMarca(): void {
    const nombre = this.nuevaMarca.trim();
    if (!nombre) {
      this.mensajeModal = 'Escribe el nombre de la marca';
      return;
    }

    this.guardando = true;
    this.inventarioService.crearMarca({ marca: nombre }).subscribe({
      next: (res: any) => {
        const nueva = res?.data;
        this.guardando = false;
        this.cerrarModal();
        this.marcas = [...this.marcas, nueva].sort((a, b) => a.marca.localeCompare(b.marca));
        this.cambio.emit(nueva.cod_marca);
        this.catalogoCambio.emit();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.guardando = false;
        this.mensajeModal = extraerMensajeError(err, 'No se pudo crear la marca');
        this.cdr.detectChanges();
      }
    });
  }

  eliminar(): void {
    if (!this.valor) return;

    const marca = this.marcas.find(m => m.cod_marca == this.valor);
    if (!confirm(`¿Eliminar la marca "${marca?.marca ?? ''}"?`)) return;

    const codigo = Number(this.valor);
    this.inventarioService.eliminarMarca(codigo).subscribe({
      next: () => {
        this.marcas = this.marcas.filter(m => m.cod_marca != codigo);
        this.mensaje = '';
        this.cambio.emit(null);
        this.catalogoCambio.emit();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensaje = extraerMensajeError(err, 'No se pudo eliminar la marca');
        this.cdr.detectChanges();
      }
    });
  }
}