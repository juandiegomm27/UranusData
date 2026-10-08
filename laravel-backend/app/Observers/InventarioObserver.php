<?php

namespace App\Observers;

use App\Models\EstadoElemento;
use App\Models\Inventario;
use App\Models\TipoElemento;
use App\Models\UbiElemento;
use App\Services\InventarioService;
use Illuminate\Support\Str;
use App\Models\Marca;

class InventarioObserver
{
    private const CAMPOS_EDITABLES = [
        'cod_elemento' => 'Código',
        'nombre_elemento' => 'Nombre',
        'serial' => 'Serial',
        'modelo' => 'Modelo',
        'descripcion' => 'Descripción',
        'cod_tipo_elemento' => 'Tipo',
        'cod_marca' => 'Marca',
    ];

    public function created(Inventario $elemento): void
    {
        $padre = $elemento->id_elemento_padre ? Inventario::find($elemento->id_elemento_padre) : null;

        $descripcion = 'Alta del elemento en el inventario';
        if ($padre) {
            $descripcion .= '. Componente de ' . $this->etiqueta($padre);
        }

        InventarioService::registrarMovimiento(
            $elemento->id_elemento,
            InventarioService::TIPO_ALTA,
            $descripcion
        );

        if ($padre) {
            InventarioService::registrarMovimiento(
                $padre->id_elemento,
                InventarioService::TIPO_VINCULO,
                'Nuevo componente: ' . $this->etiqueta($elemento),
                ['id_elemento_padre' => ['antes' => null, 'despues' => $padre->id_elemento]]
            );
        }
    }

    public function updated(Inventario $elemento): void
    {
        $this->registrarEdicion($elemento);
        $this->registrarTraslado($elemento);
        $this->registrarVinculo($elemento);
        $this->registrarEstado($elemento);
    }

    private function registrarEdicion(Inventario $elemento): void
    {
        $cambios = [];
        $partes = [];

        foreach (self::CAMPOS_EDITABLES as $campo => $etiqueta) {
            if (!$elemento->wasChanged($campo)) {
                continue;
            }

            $antes = $elemento->getOriginal($campo);

            // El código autogenerado justo después del alta no cuenta como edición
            if ($campo === 'cod_elemento' && ($antes === null || $antes === '')) {
                continue;
            }

            $despues = $elemento->getAttribute($campo);
            $cambios[$campo] = ['antes' => $antes, 'despues' => $despues];
            $partes[] = $etiqueta . ': ' . $this->valorLegible($campo, $antes) . ' → ' . $this->valorLegible($campo, $despues);
        }

        if (empty($cambios)) {
            return;
        }

        InventarioService::registrarMovimiento(
            $elemento->id_elemento,
            InventarioService::TIPO_EDICION,
            'Datos editados. ' . implode('; ', $partes),
            $cambios
        );
    }

    private function registrarTraslado(Inventario $elemento): void
    {
        if (!$elemento->wasChanged('cod_ubi_elemento')) {
            return;
        }

        $antes = $elemento->getOriginal('cod_ubi_elemento');
        $despues = $elemento->cod_ubi_elemento;

        InventarioService::registrarMovimiento(
            $elemento->id_elemento,
            InventarioService::TIPO_TRASLADO,
            'Trasladado de ' . $this->nombreUbicacion($antes) . ' a ' . $this->nombreUbicacion($despues),
            ['cod_ubi_elemento' => ['antes' => $antes, 'despues' => $despues]]
        );
    }

    private function registrarVinculo(Inventario $elemento): void
    {
        if (!$elemento->wasChanged('id_elemento_padre')) {
            return;
        }

        $antes = $elemento->getOriginal('id_elemento_padre');
        $despues = $elemento->id_elemento_padre;
        $padreAntes = $antes ? Inventario::find($antes) : null;
        $padreDespues = $despues ? Inventario::find($despues) : null;
        $datos = ['id_elemento_padre' => ['antes' => $antes, 'despues' => $despues]];
        $yo = $this->etiqueta($elemento);

        if ($padreDespues && $padreAntes) {
            $texto = 'Cambió de elemento principal: ' . $this->etiqueta($padreAntes) . ' → ' . $this->etiqueta($padreDespues);
        } elseif ($padreDespues) {
            $texto = 'Pasó a ser componente de ' . $this->etiqueta($padreDespues);
        } else {
            $texto = 'Dejó de ser componente' . ($padreAntes ? ' de ' . $this->etiqueta($padreAntes) : '');
        }

        InventarioService::registrarMovimiento($elemento->id_elemento, InventarioService::TIPO_VINCULO, $texto, $datos);

        if ($padreDespues) {
            InventarioService::registrarMovimiento(
                $padreDespues->id_elemento,
                InventarioService::TIPO_VINCULO,
                'Nuevo componente: ' . $yo,
                $datos
            );
        }

        if ($padreAntes) {
            InventarioService::registrarMovimiento(
                $padreAntes->id_elemento,
                InventarioService::TIPO_VINCULO,
                'Componente retirado: ' . $yo,
                $datos
            );
        }
    }

    private function registrarEstado(Inventario $elemento): void
    {
        if (!$elemento->wasChanged('cod_estado_elemento')) {
            return;
        }

        $antes = $elemento->getOriginal('cod_estado_elemento');
        $despues = $elemento->cod_estado_elemento;

        if ($despues == Inventario::ESTADO_BAJA) {
            $tipo = InventarioService::TIPO_BAJA;
            $descripcion = 'Dado de baja del inventario';
            if ($elemento->motivoMovimiento) {
                $descripcion .= '. Motivo: ' . $elemento->motivoMovimiento;
            }
        } elseif ($antes == Inventario::ESTADO_BAJA) {
            $tipo = InventarioService::TIPO_RESTAURACION;
            $descripcion = 'Restaurado al inventario (estado: ' . $this->nombreEstado($despues) . ')';
        } else {
            $tipo = InventarioService::TIPO_ESTADO;
            $descripcion = 'Estado: ' . $this->nombreEstado($antes) . ' → ' . $this->nombreEstado($despues);
        }

        InventarioService::registrarMovimiento(
            $elemento->id_elemento,
            $tipo,
            $descripcion,
            ['cod_estado_elemento' => ['antes' => $antes, 'despues' => $despues]]
        );

        if ($despues == Inventario::ESTADO_BAJA) {
            $this->desvincularPorBaja($elemento);
        }
    }

    // Regla de integridad: un elemento dado de baja no es componente de otro ni tiene componentes.
    // Sus componentes quedan como elementos independientes (siguen activos).
    private function desvincularPorBaja(Inventario $elemento): void
    {
        $hijos = $elemento->hijos()->get(['id_elemento', 'cod_elemento', 'nombre_elemento']);

        if ($hijos->isNotEmpty()) {
            $elemento->hijos()->update(['id_elemento_padre' => null]);
            $etiqueta = $this->etiqueta($elemento);

            foreach ($hijos as $hijo) {
                InventarioService::registrarMovimiento(
                    $hijo->id_elemento,
                    InventarioService::TIPO_VINCULO,
                    'Dejó de ser componente de ' . $etiqueta . ' (el principal fue dado de baja)',
                    ['id_elemento_padre' => ['antes' => $elemento->id_elemento, 'despues' => null]]
                );
            }

            InventarioService::registrarMovimiento(
                $elemento->id_elemento,
                InventarioService::TIPO_VINCULO,
                'Sus ' . $hijos->count() . ' componente(s) quedaron como elementos independientes: '
                    . $hijos->map(fn($h) => $this->etiqueta($h))->implode(', ')
            );
        }

        if ($elemento->id_elemento_padre) {
            $padre = Inventario::find($elemento->id_elemento_padre);
            $idPadre = $elemento->id_elemento_padre;

            Inventario::whereKey($elemento->getKey())->update(['id_elemento_padre' => null]);
            $elemento->id_elemento_padre = null;

            InventarioService::registrarMovimiento(
                $elemento->id_elemento,
                InventarioService::TIPO_VINCULO,
                'Desvinculado de ' . ($padre ? $this->etiqueta($padre) : '#' . $idPadre) . ' por la baja',
                ['id_elemento_padre' => ['antes' => $idPadre, 'despues' => null]]
            );

            if ($padre) {
                InventarioService::registrarMovimiento(
                    $padre->id_elemento,
                    InventarioService::TIPO_VINCULO,
                    'Componente retirado por baja: ' . $this->etiqueta($elemento),
                    ['id_elemento_padre' => ['antes' => $idPadre, 'despues' => null]]
                );
            }
        }
    }

    private function etiqueta(Inventario $elemento): string
    {
        return ($elemento->cod_elemento ?: '#' . $elemento->id_elemento) . ' · ' . $elemento->nombre_elemento;
    }

    private function nombreEstado($cod): string
    {
        return EstadoElemento::find($cod)?->estado ?? ('#' . $cod);
    }

    private function nombreUbicacion($cod): string
    {
        return UbiElemento::find($cod)?->ubicacion ?? ('#' . $cod);
    }

    private function valorLegible(string $campo, $valor): string
    {
        if ($valor === null || $valor === '') {
            return 'vacío';
        }

        if ($campo === 'cod_tipo_elemento') {
            return TipoElemento::find($valor)?->tipo ?? ('#' . $valor);
        }

        if ($campo === 'cod_marca') {
            return Marca::find($valor)?->marca ?? ('#' . $valor);
        }

        return Str::limit((string) $valor, 40);
    }
}
