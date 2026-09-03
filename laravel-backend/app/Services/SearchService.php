<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\Paginator;

class SearchService
{
    /**
     * Búsqueda avanzada con filtros dinámicos
     */
    public static function buscarGlobal(string $termino, ?string $tipo = null, int $limit = 10)
    {
        $resultados = [];

        // Búsqueda en usuario
        if (!$tipo || $tipo === 'usuario') {
            $usuario = \App\Models\Usuario::where('documento', 'like', "%$termino%")
                ->orWhere('nombre', 'like', "%$termino%")
                ->orWhere('apellido', 'like', "%$termino%")
                ->limit($limit)
                ->get();

            $resultados['usuario'] = $usuario;
        }

        // Búsqueda en correos
        if (!$tipo || $tipo === 'correo') {
            $correos = \App\Models\Correo::where('correo', 'like', "%$termino%")
                ->with('usuario')
                ->limit($limit)
                ->get();

            $resultados['correos'] = $correos;
        }

        // Búsqueda en equipos
        if (!$tipo || $tipo === 'inventario') {
            $equipos = \App\Models\Inventario::where('elemento', 'like', "%$termino%")
                ->limit($limit)
                ->get();

            $resultados['inventario'] = $equipos;
        }

        return $resultados;
    }

    /**
     * Aplicar filtros dinámicamente
     */
    public static function aplicarFiltros(Builder $query, array $filtros): Builder
    {
        foreach ($filtros as $campo => $valor) {
            if (is_null($valor)) {
                continue;
            }

            switch ($campo) {
                case 'documento':
                    $query->where('documento', 'like', "%$valor%");
                    break;
                case 'estado':
                    $query->where('cod_estado_usuario', $valor);
                    break;
                case 'rol':
                    $query->where('cod_rol', $valor);
                    break;
                case 'fecha_desde':
                    $query->whereDate('created_at', '>=', $valor);
                    break;
                case 'fecha_hasta':
                    $query->whereDate('created_at', '<=', $valor);
                    break;
                case 'busqueda':
                    $query->where(function ($q) use ($valor) {
                        $q->where('documento', 'like', "%$valor%")
                          ->orWhere('nombre', 'like', "%$valor%")
                          ->orWhere('apellido', 'like', "%$valor%");
                    });
                    break;
            }
        }

        return $query;
    }
}