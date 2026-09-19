<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/dashboard/resumen
     * Resumen ejecutivo del sistema
     */
    public function resumen()
    {
        try {
            $resumen = [
                'usuario' => [
                    'total' => \App\Models\Usuario::count(),
                    'activos' => \App\Models\Usuario::where('cod_estado_usuario', 1)->count(),
                    'inactivos' => \App\Models\Usuario::where('cod_estado_usuario', 2)->count(),
                    'bloqueados' => \App\Models\Usuario::where('cod_estado_usuario', 3)->count(),
                ],
                'prestamos' => [
                    'total' => \App\Models\Prestamo::count(),
                    'solicitados' => \App\Models\Prestamo::where('cod_estado_prestamo', 1)->count(),
                    'entregados' => \App\Models\Prestamo::where('cod_estado_prestamo', 2)->count(),
                    'devueltos' => \App\Models\Prestamo::where('cod_estado_prestamo', 3)->count(),
                    'perdidos' => \App\Models\Prestamo::where('cod_estado_prestamo', 4)->count(),
                    'danados' => \App\Models\Prestamo::where('cod_estado_prestamo', 5)->count(),
                ],
                'inventario' => [
                    'total' => \App\Models\Inventario::count(),
                    'disponibles' => \App\Models\Inventario::where('cod_estado_elemento', 1)->count(),
                    'en_prestamo' => \App\Models\Inventario::where('cod_estado_elemento', 2)->count(),
                    'mantenimiento' => \App\Models\Inventario::where('cod_estado_elemento', 3)->count(),
                ],
                'actualizado_en' => now()->toIso8601String()
            ];

            return $this->successResponse($resumen, 'Resumen obtenido');
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al obtener resumen: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * GET /api/dashboard/estadisticas
     * Estadísticas detalladas
     */
    public function estadisticas()
    {
        try {
            // Unimos detalles de reserva con el inventario y accesorios para contar los reales
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

                'usuarios_con_mayor_actividad' => \App\Models\Usuario::select('documento', 'nombre', 'apellido')
                    ->withCount('reserva')
                    ->orderByDesc('reservas_count')
                    ->limit(10)
                    ->get(),

                'actualizado_en' => now()->toIso8601String()
            ];

            return $this->successResponse($estadisticas, 'Estadísticas obtenidas');
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al obtener estadísticas: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * GET /api/dashboard/alertas
     * Alertas críticas
     */
    public function alertas()
    {
        try {
            $alertas = [];

            // Alertar si hay equipos perdidos
            $equipos_perdidos = \App\Models\Prestamo::where('cod_estado_prestamo', 4)->count();
            if ($equipos_perdidos > 0) {
                $alertas[] = [
                    'tipo' => 'warning',
                    'mensaje' => "$equipos_perdidos equipos reportados como perdidos",
                    'acción' => '/gestion/usuario/prestamos-activos?estado=4'
                ];
            }

            // Alertar si hay equipos dañados
            $equipos_danados = \App\Models\Prestamo::where('cod_estado_prestamo', 5)->count();
            if ($equipos_danados > 0) {
                $alertas[] = [
                    'tipo' => 'error',
                    'mensaje' => "$equipos_danados equipos reportados como dañados",
                    'acción' => '/gestion/usuario/prestamos-activos?estado=5'
                ];
            }

            // Alertar si hay prestamos antiguos sin devolver
            $prestamos_viejos = \App\Models\Prestamo::where('cod_estado_prestamo', 2)
                ->where('fecha_inicio', '<', now()->subDays(30))
                ->count();
            if ($prestamos_viejos > 0) {
                $alertas[] = [
                    'tipo' => 'info',
                    'mensaje' => "$prestamos_viejos préstamos sin devolver hace más de 30 días",
                    'acción' => '/gestion/usuario/prestamos-activos?estado=2&antiguo=true'
                ];
            }

            return $this->successResponse([
                'total_alertas' => count($alertas),
                'alertas' => $alertas,
                'actualizado_en' => now()->toIso8601String()
            ], 'Alertas obtenidas');
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error al obtener alertas: ' . $e->getMessage(),
                500
            );
        }
    }
}