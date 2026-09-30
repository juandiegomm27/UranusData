import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';

export interface ElementoPadre {
  id_elemento: number;
  cod_elemento?: string | null;
  nombre_elemento: string;
  serial?: string | null;
}

@Component({
  selector: 'app-selector-padre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-padre.html',
  styleUrls: ['./selector-padre.css']
})
export class SelectorPadreComponent implements OnInit, OnDestroy {
  @Input() padreInicial: ElementoPadre | null = null;
  @Input() excluirId: number | null = null;
  @Output() cambio = new EventEmitter<number | null>();

  private inventarioService = inject(InventarioService);
  private cdr = inject(ChangeDetectorRef);
  private temporizador: any;

  elegido: ElementoPadre | null = null;
  termino = '';
  sugerencias: ElementoPadre[] = [];
  buscado = false;

  ngOnInit(): void {
    this.elegido = this.padreInicial;
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  buscar(): void {
    clearTimeout(this.temporizador);
    const texto = this.termino.trim();

    if (texto.length < 2) {
      this.sugerencias = [];
      this.buscado = false;
      return;
    }

    this.temporizador = setTimeout(() => {
      this.inventarioService.obtenerElementos(1, 8, texto, '', '', '', true).subscribe({
        next: (res: any) => {
          this.sugerencias = (res?.data || []).filter((e: ElementoPadre) => e.id_elemento !== this.excluirId);
          this.buscado = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.sugerencias = [];
          this.buscado = true;
          this.cdr.detectChanges();
        }
      });
    }, 250);
  }

  elegir(elemento: ElementoPadre): void {
    this.elegido = elemento;
    this.termino = '';
    this.sugerencias = [];
    this.buscado = false;
    this.cambio.emit(elemento.id_elemento);
  }

  quitar(): void {
    this.elegido = null;
    this.cambio.emit(null);
  }
}