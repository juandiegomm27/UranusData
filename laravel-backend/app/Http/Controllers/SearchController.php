<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    public function global(Request $request)
    {
        $termino = $request->input('q');
        $tipo = $request->input('tipo');
        $limit = $request->input('limit', 10);

        if (!$termino) {
            return $this->errorResponse('El término de búsqueda (q) es requerido', 400);
        }

        try {
            $resultados = SearchService::buscarGlobal($termino, $tipo, $limit);
            return $this->successResponse($resultados, 'Resultados obtenidos exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error en la búsqueda global: ' . $e->getMessage(), 500);
        }
    }
}