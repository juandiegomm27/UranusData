<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TABLAS = ['inventario', 'inventario_accesorios'];

    public function up(): void
    {
        Schema::create('marca', function (Blueprint $table) {
            $table->increments('cod_marca');
            $table->string('marca', 100)->unique();
        });

        foreach (self::TABLAS as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->unsignedInteger('cod_marca')->nullable()->after('cod_tipo_elemento');
                $table->index('cod_marca');
            });
        }

        // SQLite (solo pruebas) no puede agregar llaves foráneas a una tabla existente
        // sin reconstruirla, y las vistas v_historial_* se lo impiden.
        if (DB::getDriverName() !== 'sqlite') {
            foreach (self::TABLAS as $tabla) {
                Schema::table($tabla, function (Blueprint $table) {
                    $table->foreign('cod_marca')->references('cod_marca')->on('marca');
                });
            }
        }
    }

    public function down(): void
    {
        foreach (self::TABLAS as $tabla) {
            if (DB::getDriverName() !== 'sqlite') {
                Schema::table($tabla, function (Blueprint $table) {
                    $table->dropForeign(['cod_marca']);
                });
            }

            Schema::table($tabla, function (Blueprint $table) {
                $table->dropIndex(['cod_marca']);
                $table->dropColumn('cod_marca');
            });
        }

        Schema::dropIfExists('marca');
    }
};