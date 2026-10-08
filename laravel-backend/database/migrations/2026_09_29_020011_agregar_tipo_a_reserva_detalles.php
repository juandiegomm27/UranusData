<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * El docente pide "un Computador", no una unidad concreta: id_elemento se
 * asigna después, cuando el técnico/gerente entrega el préstamo. Mientras
 * tanto necesitamos recordar qué tipo se pidió en ese detalle.
 *
 * Tanto sqlite (tests) como algunas versiones de MySQL no dejan alterar una
 * tabla mientras una vista depende de ella, así que las vistas de historial
 * se sueltan antes del ALTER y se vuelven a crear después.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_historial_reservas');
        DB::statement('DROP VIEW IF EXISTS v_historial_prestamos');

        if (!Schema::hasColumn('reserva_detalles', 'cod_tipo_elemento')) {
            Schema::table('reserva_detalles', function (Blueprint $table) {
                $table->unsignedInteger('cod_tipo_elemento')->nullable()->after('id_elemento');
                $table->foreign('cod_tipo_elemento')->references('cod_tipo_elemento')->on('tipo_elemento');
                $table->index('cod_tipo_elemento');
            });
        }

        $this->recrearVistas();
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_historial_reservas');
        DB::statement('DROP VIEW IF EXISTS v_historial_prestamos');

        if (Schema::hasColumn('reserva_detalles', 'cod_tipo_elemento')) {
            Schema::table('reserva_detalles', function (Blueprint $table) {
                $table->dropForeign(['cod_tipo_elemento']);
                $table->dropColumn('cod_tipo_elemento');
            });
        }

        $this->recrearVistas();
    }

    private function recrearVistas(): void
    {
        $driver = DB::getDriverName();
        $concatSql = $driver === 'sqlite'
            ? 'group_concat(COALESCE(i.nombre_elemento, a.nombre), ", ")'
            : 'GROUP_CONCAT(COALESCE(i.nombre_elemento, a.nombre) SEPARATOR ", ")';

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
};
