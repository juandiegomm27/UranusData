<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * La migración 2026_08_19_210907_create_uranus_data_complete tiene un guard
 * (if Schema::hasTable('rol') return;) que hizo que, en bases de datos que
 * ya existían antes de agregar reserva_detalles/stock_accesorios/
 * inventario_accesorios/historial_bajas_general, esas tablas nunca se
 * crearan aunque la migración quedó marcada como "Ran". Esta migración
 * agrega solo esas tablas faltantes, sin tocar ni borrar nada existente.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('inventario_accesorios')) {
            Schema::create('inventario_accesorios', function (Blueprint $table) {
                $table->increments('id_accesorio');
                $table->string('nombre', 100);
                $table->string('modelo', 100)->nullable();
                $table->text('descripcion')->nullable();
                $table->unsignedInteger('cod_tipo_elemento')->nullable();
                $table->integer('cantidad_total')->default(0);
                $table->integer('cantidad_disponible')->default(0);

                $table->foreign('cod_tipo_elemento')->references('cod_tipo_elemento')->on('tipo_elemento');
                $table->index('cod_tipo_elemento');
            });
        }

        if (!Schema::hasTable('stock_accesorios')) {
            Schema::create('stock_accesorios', function (Blueprint $table) {
                $table->increments('id_stock');
                $table->unsignedInteger('id_accesorio');
                $table->unsignedInteger('cod_ubi_elemento');
                $table->integer('cantidad_total')->default(0);
                $table->integer('cantidad_disponible')->default(0);

                $table->foreign('id_accesorio')->references('id_accesorio')->on('inventario_accesorios')->onDelete('cascade');
                $table->foreign('cod_ubi_elemento')->references('cod_ubi_elemento')->on('ubi_elemento');
                $table->unique(['id_accesorio', 'cod_ubi_elemento']);
                $table->index('id_accesorio');
                $table->index('cod_ubi_elemento');
            });
        }

        if (!Schema::hasTable('reserva_detalles')) {
            Schema::create('reserva_detalles', function (Blueprint $table) {
                $table->increments('id_detalle');
                $table->unsignedInteger('id_Reserva');
                $table->unsignedInteger('id_elemento')->nullable();
                $table->unsignedInteger('id_stock')->nullable();
                $table->integer('cantidad_solicitada')->default(1);
                $table->integer('cantidad_entregada')->default(0);
                $table->integer('cantidad_devuelta')->default(0);

                $table->foreign('id_Reserva')->references('id_Reserva')->on('Reserva')->onDelete('cascade');
                $table->foreign('id_elemento')->references('id_elemento')->on('inventario');
                $table->foreign('id_stock')->references('id_stock')->on('stock_accesorios');
                $table->index('id_Reserva');
                $table->index('id_elemento');
                $table->index('id_stock');
            });
        }

        if (!Schema::hasTable('historial_bajas_general')) {
            Schema::create('historial_bajas_general', function (Blueprint $table) {
                $table->increments('id_baja');
                $table->enum('tipo_item', ['activo', 'accesorio']);
                $table->unsignedInteger('id_original');
                $table->string('nombre', 100);
                $table->string('codigo_identificacion', 100)->nullable();
                $table->string('modelo', 100)->nullable();
                $table->text('descripcion')->nullable();
                $table->integer('cantidad')->default(1);
                $table->unsignedInteger('cod_tipo_elemento')->nullable();
                $table->unsignedInteger('cod_ubi_elemento')->nullable();
                $table->string('ubicacion', 100)->nullable();
                $table->string('motivo', 255)->nullable();
                $table->timestamp('fecha_baja')->useCurrent();
            });
        }

        // La tabla prestamo también quedó en su versión vieja (solo tenía
        // fecha_entrega/cantidad); se agregan las columnas nuevas que usa
        // el modelo Prestamo actual, y se rellenan a partir de las viejas
        // para no perder la fecha límite de los préstamos ya existentes.
        if (!Schema::hasColumn('prestamo', 'fecha_entrega_original')) {
            Schema::table('prestamo', function (Blueprint $table) {
                $table->date('fecha_entrega_original')->nullable()->after('fecha_inicio');
                $table->date('fecha_limite_actual')->nullable()->after('fecha_entrega_original');
                $table->boolean('extension_aprobada')->default(false)->after('fecha_limite_actual');
            });

            if (Schema::hasColumn('prestamo', 'fecha_entrega')) {
                DB::statement('UPDATE prestamo SET fecha_entrega_original = fecha_entrega, fecha_limite_actual = fecha_entrega WHERE fecha_limite_actual IS NULL');
            }
        }

        // Las vistas de historial dependen de reserva_detalles/stock_accesorios/
        // inventario_accesorios, que antes no existían: se recrean para que
        // reflejen las tablas nuevas. GROUP_CONCAT no usa la misma sintaxis
        // en sqlite (motor de los tests) que en MySQL.
        $driver = DB::getDriverName();
        $concatSql = $driver === 'sqlite'
            ? 'group_concat(COALESCE(i.nombre_elemento, a.nombre), ", ")'
            : 'GROUP_CONCAT(COALESCE(i.nombre_elemento, a.nombre) SEPARATOR ", ")';

        DB::statement('DROP VIEW IF EXISTS v_historial_reservas');
        DB::statement('DROP VIEW IF EXISTS v_historial_prestamos');

        DB::statement("
            CREATE VIEW v_historial_prestamos AS
            SELECT
                p.id_Reserva,
                p.cod_estado_prestamo,
                ep.estado AS estado_prestamo,
                p.fecha_inicio,
                p.fecha_limite_actual AS fecha_entrega,
                (SELECT {$concatSql}
                 FROM reserva_detalles rd
                 LEFT JOIN inventario i ON rd.id_elemento = i.id_elemento
                 LEFT JOIN stock_accesorios sa ON rd.id_stock = sa.id_stock
                 LEFT JOIN inventario_accesorios a ON sa.id_accesorio = a.id_accesorio
                 WHERE rd.id_Reserva = r.id_Reserva) AS elemento,
                (SELECT SUM(cantidad_solicitada) FROM reserva_detalles WHERE id_Reserva = r.id_Reserva) AS cantidad,
                u.documento,
                u.nombre,
                u.apellido
            FROM prestamo p
            LEFT JOIN estado_prestamo ep ON p.cod_estado_prestamo = ep.cod_estado_prestamo
            LEFT JOIN Reserva r ON p.id_Reserva = r.id_Reserva
            LEFT JOIN usuario u ON r.documento = u.documento
        ");

        DB::statement("
            CREATE VIEW v_historial_reservas AS
            SELECT
                r.id_Reserva,
                r.Num_estado,
                er.estado AS estado_reserva,
                r.fecha,
                r.plazo,
                (SELECT {$concatSql}
                 FROM reserva_detalles rd
                 LEFT JOIN inventario i ON rd.id_elemento = i.id_elemento
                 LEFT JOIN stock_accesorios sa ON rd.id_stock = sa.id_stock
                 LEFT JOIN inventario_accesorios a ON sa.id_accesorio = a.id_accesorio
                 WHERE rd.id_Reserva = r.id_Reserva) AS elemento,
                (SELECT SUM(cantidad_solicitada) FROM reserva_detalles WHERE id_Reserva = r.id_Reserva) AS cantidad,
                u.documento,
                u.nombre,
                u.apellido
            FROM Reserva r
            LEFT JOIN estado_reserva er ON r.Num_estado = er.Num_estado
            LEFT JOIN usuario u ON r.documento = u.documento
        ");
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_historial_reservas');
        DB::statement('DROP VIEW IF EXISTS v_historial_prestamos');

        if (Schema::hasColumn('prestamo', 'fecha_entrega_original')) {
            Schema::table('prestamo', function (Blueprint $table) {
                $table->dropColumn(['fecha_entrega_original', 'fecha_limite_actual', 'extension_aprobada']);
            });
        }

        Schema::dropIfExists('reserva_detalles');
        Schema::dropIfExists('stock_accesorios');
        Schema::dropIfExists('inventario_accesorios');
        Schema::dropIfExists('historial_bajas_general');
    }
};
