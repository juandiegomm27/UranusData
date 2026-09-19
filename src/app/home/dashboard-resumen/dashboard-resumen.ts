import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { InventarioService } from '../../modulos/Inventario/services/inventario.service';
import { PrestamosActivosService, PrestamoActivo } from '../../modulos/gestion-usuarios/services/prestamos-activos.service';
import { AuthService } from '../../core/service/auth.service';

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
  private prestamosService = inject(PrestamosActivosService);
  private authService = inject(AuthService);

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
  prestamosRecientes = signal<PrestamoActivo[]>([]);

  // Diccionarios dinámicos para almacenar la configuración de la Base de Datos
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
    this.cargarPrestamos();
  }

  private cargarOpcionesBD(): void {
    this.inventarioService.obtenerOpciones().subscribe({
      next: (response: any) => {
        if (response.success) {
          response.estados?.forEach((e: any) => {
            this.estadosDB[e.cod_estado_elemento] = e.estado;
          });
          response.tipos?.forEach((t: any) => {
            this.tiposDB[t.cod_tipo_elemento] = t.tipo;
          });
          response.ubicaciones?.forEach((u: any) => {
            this.ubicacionesDB[u.cod_ubi_elemento] = u.ubicacion;
          });
        }
        this.cargarInventario();
      },
      error: (err) => {
        console.error('Error cargando opciones de la BD:', err);
        this.cargarInventario(); 
      }
    });
  }

  obtenerNombreTipoItem(item: any): string {
    if (typeof item.tipo === 'string' && item.tipo.trim() !== '') return item.tipo;
    if (item.tipo?.tipo) return item.tipo.tipo;
    if (item.tipo?.nombre) return item.tipo.nombre;
    if (item.tipo_elemento) return item.tipo_elemento;

    const idTipo = item.cod_tipo_elemento || (typeof item.tipo === 'number' ? item.tipo : null);
    return this.tiposDB[Number(idTipo)] || 'Desconocido';
  }

  obtenerNombreUbicacionItem(item: any): string {
    if (typeof item.ubicacion === 'string' && item.ubicacion.trim() !== '') return item.ubicacion;
    if (item.ubicacion?.ubicacion) return item.ubicacion.ubicacion;
    if (item.ubicacion?.nombre) return item.ubicacion.nombre;
    if (item.nombre_ubicacion) return item.nombre_ubicacion;

    const idUbi = item.cod_ubi_elemento || (typeof item.ubicacion === 'number' ? item.ubicacion : null);
    return this.ubicacionesDB[Number(idUbi)] || 'Desconocida';
  }

  obtenerNombreEstadoItem(item: any): string {
    if (typeof item.estado === 'string' && item.estado.trim() !== '') return item.estado;
    if (item.estado?.estado) return item.estado.estado;
    if (item.estado?.nombre) return item.estado.nombre;
    if (item.nombre_estado) return item.nombre_estado;

    const idEstado = item.cod_estado_elemento || (typeof item.estado === 'number' ? item.estado : null);
    return this.estadosDB[Number(idEstado)] || 'Desconocido';
  }

  private cargarInventario(): void {
    this.inventarioService.obtenerElementos(1, 200).subscribe({
      next: (response: any) => {
        const items: any[] = response.data ?? [];
        const total = response.pagination?.total ?? response.total ?? items.length;
        this.totalElementos.set(total);
        
        this.totalActivos.set(
          items.filter(i => {
            const estadoStr = this.obtenerNombreEstadoItem(i).toLowerCase();
            return estadoStr === 'activo';
          }).length
        );

        const conteo: Record<string, number> = {};
        items.forEach(i => {
          const tipo = this.obtenerNombreTipoItem(i);
          conteo[tipo] = (conteo[tipo] || 0) + 1;
        });

        this.distribucionTipo.set(
          Object.entries(conteo).map(([name, value]) => ({ name, value }))
        );
        this.inventarioTabla.set(items.slice(0, 8));
        this.cargandoInventario.set(false);
      },
      error: (error) => {
        console.error('Error cargando inventario:', error);
        this.cargandoInventario.set(false);
      }
    });
  }

  private cargarPrestamos(): void {
    this.prestamosService.obtenerPrestamosActivos(1, 50).subscribe({
      next: (response) => {
        const items = response.data ?? [];
        this.totalSolicitudesAbiertas.set(items.filter(p => p.cod_estado_prestamo === 1).length);
        this.totalEnPrestamo.set(items.filter(p => p.cod_estado_prestamo === 2).length);
        this.prestamosRecientes.set(
          [...items]
            .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime())
            .slice(0, 4)
        );
        this.cargandoPrestamos.set(false);
      },
      error: (error) => {
        console.error('Error cargando préstamos:', error);
        this.cargandoPrestamos.set(false);
      }
    });
  }

  obtenerNombreEstadoPrestamo(cod: number): string {
    const estados: Record<number, string> = {
      1: 'Solicitado', 2: 'Entregado', 3: 'Devuelto', 4: 'Perdido', 5: 'Dañado'
    };
    return estados[cod] || 'Desconocido';
  }

  obtenerClaseEstadoPrestamo(cod: number): string {
    const clases: Record<number, string> = {
      1: 'estado-solicitado', 2: 'estado-entregado', 3: 'estado-devuelto',
      4: 'estado-perdido', 5: 'estado-danado'
    };
    return clases[cod] || '';
  }

  obtenerClaseEstadoElemento(estado: string): string {
    const estadoNorm = (estado || '').toLowerCase();
    
    // Buscar palabras clave independientemente de variaciones en la BD
    if (estadoNorm.includes('activo') && !estadoNorm.includes('inactivo')) return 'estado-activo';
    if (estadoNorm.includes('inactivo')) return 'estado-inactivo';
    if (estadoNorm.includes('baja') || estadoNorm.includes('dañado') || estadoNorm.includes('danado')) return 'estado-danado';
    if (estadoNorm.includes('mantenimiento') || estadoNorm.includes('pendiente')) return 'estado-pendiente';
    
    return 'estado-inactivo'; 
  }
}