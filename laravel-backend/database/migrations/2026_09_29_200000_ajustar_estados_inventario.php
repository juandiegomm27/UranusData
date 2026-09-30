<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Normalizar vacíos y validar duplicados antes de crear índices únicos
        foreach (['serial', 'cod_elemento'] as $columna) {
            DB::table('inventario')->where($columna, '')->update([$columna => null]);

            $duplicados = DB::table('inventario')
                ->select($columna)
                ->whereNotNull($columna)
                ->groupBy($columna)
                ->havingRaw('COUNT(*) > 1')
                ->pluck($columna);

            if ($duplicados->isNotEmpty()) {
                throw new \RuntimeException(
                    "No se puede crear el índice único de '{$columna}'. Valores duplicados: "
                    . $duplicados->implode(', ')
                    . '. Corrígelos y ejecuta la migración de nuevo.'
                );
            }
        }

        // 2. Catálogo: 2 = En préstamo, 4 = Baja (coincide con el módulo de reservas)
        DB::table('estado_elemento')->updateOrInsert(
            ['cod_estado_elemento' => 4],
            ['estado' => 'Baja']
        );

        // 3. Los equipos que estaban en 2 por una baja pasan a 4
        DB::table('inventario')
            ->where('cod_estado_elemento', 2)
            ->whereIn('id_elemento', function ($q) {
                $q->select('id_original')
                    ->from('historial_bajas_general')
                    ->where('tipo_item', 'activo');
            })
            ->update(['cod_estado_elemento' => 4]);

        DB::table('estado_elemento')->updateOrInsert(
            ['cod_estado_elemento' => 2],
            ['estado' => 'En préstamo']
        );

        // 4. Índices únicos (antes solo se validaba en el controlador)
        Schema::table('inventario', function (Blueprint $table) {
            $table->unique('serial');
            $table->unique('cod_elemento');
        });
    }

    public function down(): void
    {
        Schema::table('inventario', function (Blueprint $table) {
            $table->dropUnique(['serial']);
            $table->dropUnique(['cod_elemento']);
        });

        DB::table('inventario')->where('cod_estado_elemento', 4)->update(['cod_estado_elemento' => 2]);
        DB::table('estado_elemento')->where('cod_estado_elemento', 2)->update(['estado' => 'Inactivo']);
        DB::table('estado_elemento')->where('cod_estado_elemento', 4)->delete();
    }
};