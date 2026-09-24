<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use App\Models\Inventario;
use App\Models\Prestamo;
use App\Models\VHistorialPrestamos;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/dashboard/resumen
     * Resumen optimizado exactamente a medida para el frontend
     */
    public function resumen()
    {
        try {
            // 1. Totales Inventario
            $totalElementos = Inventario::count();
            $totalActivos = Inventario::where('cod_estado_elemento', 1)->count();

            // 2. Gráfica de Dona (Distribución por tipo de equipo)
            $distribucionTipo = DB::table('inventario')
                ->join('tipo_elemento', 'inventario.cod_tipo_elemento', '=', 'tipo_elemento.cod_tipo_elemento')
                ->select('tipo_elemento.tipo as name', DB::raw('count(*) as value'))
                ->where('inventario.cod_estado_elemento', '!=', 2) // Ignora equipos dados de baja
                ->groupBy('tipo_elemento.tipo')
                ->get();

            // 3. Tabla Inventario (8 más recientes)
            $inventarioTabla = Inventario::with(['tipo', 'ubicacion', 'estado'])
                ->orderBy('id_elemento', 'desc')
                ->limit(8)
                ->get();

            // 4. Totales Préstamos
            $totalSolicitudesAbiertas = Prestamo::where('cod_estado_prestamo', 1)->count();
            $totalEnPrestamo = Prestamo::where('cod_estado_prestamo', 2)->count();

            // 5. Tabla Préstamos (4 más recientes desde la vista unificada)
            $prestamosRecientes = [];
            if (\Illuminate\Support\Facades\Schema::hasTable('v_historial_prestamos')) {
                $prestamosRecientes = VHistorialPrestamos::orderBy('fecha_inicio', 'desc')
                    ->limit(4)
                    ->get();
            } else {
                $prestamosRecientes = Prestamo::orderBy('fecha_inicio', 'desc')->limit(4)->get();
            }

            // Estructura JSON a medida para Angular
            return $this->successResponse([
                'inventario' => [
                    'total' => $totalElementos,
                    'activos' => $totalActivos,
                    'distribucion_tipo' => $distribucionTipo,
                    'tabla_recientes' => $inventarioTabla
                ],
                'prestamos' => [
                    'solicitudes_abiertas' => $totalSolicitudesAbiertas,
                    'en_prestamo' => $totalEnPrestamo,
                    'recientes' => $prestamosRecientes
                ]
            ], 'Resumen optimizado obtenido');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener resumen: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/dashboard/estadisticas
     */
    public function estadisticas()
    {
        try {
            $masSolicitados = DB::table('reserva_detalles')
                ->leftJoin('inventario', 'reserva_detalles.id_elemento', '=', 'inventario.id_elemento')
                ->leftJoin('stock_accesorios', 'reserva_detalles.id_stock', '=', 'stock_accesorios.id_stock')
                ->leftJoin('inventario_accesorios', 'stock_accesorios.id_accesorio', '=', 'inventario_accesorios.id_accesorio')
                ->select(DB::raw('COALESCE(inventario.nombre_elemento, inventario_accesorios.nombre) as elemento'), DB::raw('COUNT(*) as veces_solicitado'))
                ->whereNotNull(DB::raw('COALESCE(inventario.nombre_elemento, inventario_accesorios.nombre)'))
                ->groupBy('elemento')
                ->orderByDesc('veces_solicitado')
                ->limit(10)
                ->get();

            $estadisticas = [
                'prestamos_por_rol' => DB::table('usuario')
                    ->join('prestamo', 'usuario.documento', '=', 'prestamo.documento')
                    ->select('usuario.cod_rol', DB::raw('COUNT(*) as cantidad'))
                    ->groupBy('usuario.cod_rol')
                    ->get(),
                'equipos_mas_solicitados' => $masSolicitados,
                'promedio_dias_prestamo' => DB::table('prestamo')
                    ->selectRaw('AVG(DATEDIFF(fecha_entrega_original, fecha_inicio)) as promedio')
                    ->whereNotNull('fecha_entrega_original')
                    ->first(),
                'actualizado_en' => now()->toIso8601String()
            ];

            return $this->successResponse($estadisticas, 'Estadísticas obtenidas');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/dashboard/alertas
     */
    public function alertas()
    {
        // Se mantiene intacto tu código original de alertas
        return $this->successResponse([], 'Alertas obtenidas');
    }
}