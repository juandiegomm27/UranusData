<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogosSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Estados de Elemento (Inventario)
        $estadosElemento = [
            ['cod_estado_elemento' => 1, 'estado' => 'Activo'],
            ['cod_estado_elemento' => 2, 'estado' => 'Inactivo'],
            ['cod_estado_elemento' => 3, 'estado' => 'Dañado'],
            ['cod_estado_elemento' => 4, 'estado' => 'Mantenimiento'],
        ];
        DB::table('estado_elemento')->insertOrIgnore($estadosElemento);

        // 2. Tipos de Elemento
        $tiposElemento = [
            ['cod_tipo_elemento' => 1, 'tipo' => 'Computador'],
            ['cod_tipo_elemento' => 2, 'tipo' => 'Monitor'],
            ['cod_tipo_elemento' => 3, 'tipo' => 'Proyector'],
            ['cod_tipo_elemento' => 4, 'tipo' => 'Accesorio'],
            ['cod_tipo_elemento' => 5, 'tipo' => 'Impresora'],
            ['cod_tipo_elemento' => 6, 'tipo' => 'Router'],
            ['cod_tipo_elemento' => 7, 'tipo' => 'Servidor'],
            ['cod_tipo_elemento' => 8, 'tipo' => 'Webcam'],
        ];
        DB::table('tipo_elemento')->insertOrIgnore($tiposElemento);

        // 3. Ubicaciones (Salas)
        $ubicaciones = [
            ['cod_ubi_elemento' => 1, 'ubicacion' => 'Sala 1'],
            ['cod_ubi_elemento' => 2, 'ubicacion' => 'Sala 2'],
            ['cod_ubi_elemento' => 3, 'ubicacion' => 'Almacén Central'],
            ['cod_ubi_elemento' => 4, 'ubicacion' => 'Sala 3'],
            ['cod_ubi_elemento' => 5, 'ubicacion' => 'Laboratorio de Redes'],
            ['cod_ubi_elemento' => 6, 'ubicacion' => 'Biblioteca'],
            ['cod_ubi_elemento' => 7, 'ubicacion' => 'Dirección Académica'],
        ];
        DB::table('ubi_elemento')->insertOrIgnore($ubicaciones);

        // 4. Tipos de Mantenimiento
        $tiposMantenimiento = [
            ['cod_tipo_mantenimiento' => 1, 'tipo' => 'Preventivo'],
            ['cod_tipo_mantenimiento' => 2, 'tipo' => 'Correctivo'],
            ['cod_tipo_mantenimiento' => 3, 'tipo' => 'Actualización/Mejora'],
            ['cod_tipo_mantenimiento' => 4, 'tipo' => 'Revisión Técnica'],
        ];
        DB::table('tipo_mantenimiento')->insertOrIgnore($tiposMantenimiento);

        // 5. Estados de Reserva
        $estadosReserva = [
            ['Num_estado' => 1, 'estado' => 'Pendiente'],
            ['Num_estado' => 2, 'estado' => 'Aprobada'],
            ['Num_estado' => 3, 'estado' => 'Rechazada'],
        ];
        DB::table('estado_reserva')->insertOrIgnore($estadosReserva);

        // 6. Estados de Préstamo
        $estadosPrestamo = [
            ['cod_estado_prestamo' => 1, 'estado' => 'Solicitado'],
            ['cod_estado_prestamo' => 2, 'estado' => 'Entregado'],
            ['cod_estado_prestamo' => 3, 'estado' => 'Devuelto'],
            ['cod_estado_prestamo' => 4, 'estado' => 'Perdido'],
            ['cod_estado_prestamo' => 5, 'estado' => 'Dañado'],
        ];
        DB::table('estado_prestamo')->insertOrIgnore($estadosPrestamo);

        // 7. Estados de Mantenimiento
        $estadosMantenimiento = [
            ['cod_estado_mantenimiento' => 1, 'estado' => 'Pendiente'],
            ['cod_estado_mantenimiento' => 2, 'estado' => 'En pausa'],
            ['cod_estado_mantenimiento' => 3, 'estado' => 'Finalizado'],
        ];
        DB::table('estado_mantenimiento')->insertOrIgnore($estadosMantenimiento);
    }
}