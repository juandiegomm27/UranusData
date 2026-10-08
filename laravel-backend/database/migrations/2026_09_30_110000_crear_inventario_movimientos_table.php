<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventario_movimientos', function (Blueprint $table) {
            $table->increments('id_movimiento');
            $table->unsignedInteger('id_elemento');
            $table->string('tipo', 30);
            $table->text('descripcion');
            $table->json('datos')->nullable();
            $table->string('documento', 20)->nullable();
            $table->string('usuario', 100)->nullable();
            $table->timestamp('fecha')->useCurrent();

            $table->foreign('id_elemento')->references('id_elemento')->on('inventario');
            $table->index(['id_elemento', 'id_movimiento']);
        });

        // Registro inicial para los elementos que ya existían antes del historial
        DB::table('inventario')->orderBy('id_elemento')->chunkById(200, function ($elementos) {
            $filas = [];
            foreach ($elementos as $elemento) {
                $filas[] = [
                    'id_elemento' => $elemento->id_elemento,
                    'tipo' => 'alta',
                    'descripcion' => 'Registro existente antes de activar el historial de movimientos',
                    'fecha' => now(),
                ];
            }
            DB::table('inventario_movimientos')->insert($filas);
        }, 'id_elemento');
    }

    public function down(): void
    {
        Schema::dropIfExists('inventario_movimientos');
    }
};