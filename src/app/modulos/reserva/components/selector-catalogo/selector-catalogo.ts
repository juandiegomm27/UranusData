import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AccesorioDisponible,
  DetalleReservaPayload,
  ElementoDisponible,
  ReservaService
} from '../../services/reserva.service';

interface TipoElemento {
  cod_tipo_elemento: number;
  tipo: string;
}

interface ItemSeleccionado extends DetalleReservaPayload {
  nombre: string;
  maxCantidad: number;
}

@Component({
  selector: 'app-selector-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-catalogo.html',
  styleUrl: './selector-catalogo.css'
})
export class SelectorCatalogoComponent implements OnInit {
  private reservaService = inject(ReservaService);

  @Output() cambioSeleccion = new EventEmitter<DetalleReservaPayload[]>();

  // Signals: esta app corre sin zone.js, así que el estado que se llena
  // desde respuestas HTTP (asíncronas) debe ser un signal para que la
  // vista se vuelva a pintar; una propiedad normal mutada en un
  // subscribe() no dispara change detection.
  elementos = signal<ElementoDisponible[]>([]);
  accesorios = signal<AccesorioDisponible[]>([]);
  tipos = signal<TipoElemento[]>([]);
  cargando = signal(false);
  seleccionados = signal<ItemSeleccionado[]>([]);

  busqueda = '';
  tipoSeleccionado = '';

  ngOnInit(): void {
    this.reservaService.obtenerTiposElemento().subscribe({
      next: (res) => this.tipos.set(res.data || [])
    });
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.cargando.set(true);
    this.reservaService.obtenerElementosDisponibles(this.busqueda, this.tipoSeleccionado).subscribe({
      next: (res) => {
        this.elementos.set(res.data || []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });

    this.reservaService.obtenerAccesoriosDisponibles(this.busqueda, this.tipoSeleccionado).subscribe({
      next: (res) => this.accesorios.set(res.data || [])
    });
  }

  buscar(): void {
    this.cargarCatalogo();
  }

  estaSeleccionadoElemento(idElemento: number): boolean {
    return this.seleccionados().some(s => s.id_elemento === idElemento);
  }

  estaSeleccionadoAccesorio(idStock: number): boolean {
    return this.seleccionados().some(s => s.id_stock === idStock);
  }

  agregarElemento(elemento: ElementoDisponible): void {
    if (this.estaSeleccionadoElemento(elemento.id_elemento)) return;
    this.seleccionados.update(actual => [...actual, {
      id_elemento: elemento.id_elemento,
      cantidad: 1,
      nombre: elemento.nombre_elemento,
      maxCantidad: 1
    }]);
    this.emitirCambio();
  }

  agregarAccesorio(accesorio: AccesorioDisponible): void {
    if (this.estaSeleccionadoAccesorio(accesorio.id_stock)) return;
    this.seleccionados.update(actual => [...actual, {
      id_stock: accesorio.id_stock,
      cantidad: 1,
      nombre: accesorio.accesorio?.nombre || 'Accesorio',
      maxCantidad: accesorio.cantidad_disponible
    }]);
    this.emitirCambio();
  }

  actualizarCantidad(item: ItemSeleccionado, cantidad: number): void {
    const cantidadFinal = Math.max(1, Math.min(cantidad, item.maxCantidad));
    this.seleccionados.update(actual =>
      actual.map(s => s === item ? { ...s, cantidad: cantidadFinal } : s)
    );
    this.emitirCambio();
  }

  quitarSeleccionado(item: ItemSeleccionado): void {
    this.seleccionados.update(actual => actual.filter(s => s !== item));
    this.emitirCambio();
  }

  private emitirCambio(): void {
    const detalles: DetalleReservaPayload[] = this.seleccionados().map(s => ({
      id_elemento: s.id_elemento,
      id_stock: s.id_stock,
      cantidad: s.cantidad
    }));
    this.cambioSeleccion.emit(detalles);
  }
}
