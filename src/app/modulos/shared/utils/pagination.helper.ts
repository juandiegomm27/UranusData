export abstract class PaginationHelper {
  cargando: boolean = true;
  paginaActual: number = 1;
  perPage: number = 10;
  totalElementos: number = 0;
  totalPaginas: number = 0;
  terminoBusqueda: string = '';

  abstract cargarDatos(): void;

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarDatos();
    }
  }

  cambiarPerPage(nuevaPerPage: number): void {
    this.perPage = Number(nuevaPerPage);
    this.paginaActual = 1;
    this.cargarDatos();
  }

  aplicarFiltrosBase(): void {
    this.paginaActual = 1;
    this.cargarDatos();
  }

  limpiarFiltrosBase(): void {
    this.terminoBusqueda = '';
    this.paginaActual = 1;
  }
}