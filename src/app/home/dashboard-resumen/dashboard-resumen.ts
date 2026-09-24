import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { InventarioService } from '../../modulos/inventario/services/inventario.service';
import { AuthService } from '../../core/service/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface AccesoRapido {
  ruta: string;
  icono: string;
  titulo: string;
  subtitulo: string;
}

@Component({
  selector: 'app-dashboard-resumen',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxChartsModule],
  templateUrl: './dashboard-resumen.html',
  styleUrl: './dashboard-resumen.css'
})
export class DashboardResumen implements OnInit {
  private inventarioService = inject(InventarioService);
  private authService = inject(AuthService);
  private http = inject(HttpClient); // Añadido para consumo directo y veloz

  private rol = this.authService.getRol();

  accesosRapidos = computed<AccesoRapido[]>(() => {
    if (this.rol === 'Gerente') {
      return [
        { ruta: '/modulos/gestion-usuarios', icono: '/icons/usuarios.svg', titulo: 'Gestión de usuarios', subtitulo: 'Roles y estados' },
        { ruta: '/reserva/consultar', icono: '/icons/consultar.svg', titulo: 'Consultar reservas', subtitulo: 'Ver todas' },
        { ruta: '/modulos/mantenimiento', icono: '/icons/mantenimiento.svg', titulo: 'Mantenimientos', subtitulo: 'Historial de reportes' }
      ];
    }
    if (this.rol === 'Tecnico') {
      return [
        { ruta: '/reserva/ver', icono: '/icons/consultar.svg', titulo: 'Reserva', subtitulo: 'Ver detalle' },
        { ruta: '/inventario/reportes', icono: '/icons/consultar.svg', titulo: 'Consulta reserva', subtitulo: 'Reportes' },
        { ruta: '/modulos/mantenimiento', icono: '/icons/mantenimiento.svg', titulo: 'Mantenimiento', subtitulo: 'Historial de reportes' }
      ];
    }
    return [];
  });

  cargandoInventario = signal(true);
  cargandoPrestamos = signal(true);
  totalElementos = signal(0);
  totalActivos = signal(0);
  distribucionTipo = signal<{ name: string; value: number }[]>([]);
  inventarioTabla = signal<any[]>([]);
  totalEnPrestamo = signal(0);
  totalSolicitudesAbiertas = signal(0);
  prestamosRecientes = signal<any[]>([]);

  estadosDB: Record<number, string> = {};
  tiposDB: Record<number, string> = {};
  ubicacionesDB: Record<number, string> = {};

  colorScheme: Color = {
    name: 'esquemaUranus',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#1C74A0', '#FF9F13', '#28a745', '#dc3545', '#6c757d', '#17a2b8', '#6f42c1']
  };

  vistaGrafico: [number, number] = [540, 260];
  posicionLeyenda: LegendPosition = LegendPosition.Right;

  ngOnInit(): void {
    this.cargarOpcionesBD();
  }

  private cargarOpcionesBD(): void {
    this.inventarioService.obtenerOpciones().subscribe({
      next: (response: any) => {
        if (response.success) {
          response.estados?.forEach((e: any) => this.estadosDB[e.cod_estado_elemento] = e.estado);
          response.tipos?.forEach((t: any) => this.tiposDB[t.cod_tipo_elemento] = t.tipo);
          response.ubicaciones?.forEach((u: any) => this.ubicacionesDB[u.cod_ubi_elemento] = u.ubicacion);
        }
        // Cuando carga los diccionarios, llama al Dashboard optimizado
        this.cargarDatosDashboard();
      },
      error: (err) => {
        console.error('Error cargando opciones de la BD:', err);
        this.cargarDatosDashboard();
      }
    });
  }

  private cargarDatosDashboard(): void {
    this.http.get<any>(`${environment.apiUrl}/dashboard/resumen`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;

          // Asigna valores directos de la nueva API optimizada
          this.totalElementos.set(d.inventario.total);
          this.totalActivos.set(d.inventario.activos);
          this.distribucionTipo.set(d.inventario.distribucion_tipo);
          this.inventarioTabla.set(d.inventario.tabla_recientes);

          this.totalSolicitudesAbiertas.set(d.prestamos.solicitudes_abiertas);
          this.totalEnPrestamo.set(d.prestamos.en_prestamo);
          this.prestamosRecientes.set(d.prestamos.recientes);
        }
        this.cargandoInventario.set(false);
        this.cargandoPrestamos.set(false);
      },
      error: (err) => {
        console.error('Error cargando dashboard optimizado:', err);
        this.cargandoInventario.set(false);
        this.cargandoPrestamos.set(false);
      }
    });
  }

  obtenerNombreTipoItem(item: any): string {
    if (item.tipo?.tipo) return item.tipo.tipo;
    if (item.tipo_elemento) return item.tipo_elemento;
    const idTipo = item.cod_tipo_elemento || (typeof item.tipo === 'number' ? item.tipo : null);
    return this.tiposDB[Number(idTipo)] || 'Desconocido';
  }

  obtenerNombreUbicacionItem(item: any): string {
    if (item.ubicacion?.ubicacion) return item.ubicacion.ubicacion;
    if (item.nombre_ubicacion) return item.nombre_ubicacion;
    const idUbi = item.cod_ubi_elemento || (typeof item.ubicacion === 'number' ? item.ubicacion : null);
    return this.ubicacionesDB[Number(idUbi)] || 'Desconocida';
  }

  obtenerNombreEstadoItem(item: any): string {
    if (item.estado?.estado) return item.estado.estado;
    if (item.nombre_estado) return item.nombre_estado;
    const idEstado = item.cod_estado_elemento || (typeof item.estado === 'number' ? item.estado : null);
    return this.estadosDB[Number(idEstado)] || 'Desconocido';
  }

  obtenerNombreEstadoPrestamo(cod: number): string {
    const estados: Record<number, string> = { 1: 'Solicitado', 2: 'Entregado', 3: 'Devuelto', 4: 'Perdido', 5: 'Dañado' };
    return estados[cod] || 'Desconocido';
  }

  obtenerClaseEstadoPrestamo(cod: number): string {
    const clases: Record<number, string> = { 1: 'estado-solicitado', 2: 'estado-entregado', 3: 'estado-devuelto', 4: 'estado-perdido', 5: 'estado-danado' };
    return clases[cod] || '';
  }

  obtenerClaseEstadoElemento(estado: string): string {
    const estadoNorm = (estado || '').toLowerCase();
    if (estadoNorm.includes('activo') && !estadoNorm.includes('inactivo')) return 'estado-activo';
    if (estadoNorm.includes('inactivo')) return 'estado-inactivo';
    if (estadoNorm.includes('baja') || estadoNorm.includes('dañado') || estadoNorm.includes('danado')) return 'estado-danado';
    if (estadoNorm.includes('mantenimiento') || estadoNorm.includes('pendiente')) return 'estado-pendiente';
    return 'estado-inactivo';
  }
}