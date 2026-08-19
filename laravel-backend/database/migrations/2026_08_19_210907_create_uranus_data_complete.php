<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        //  TABLAS BASE =====================
        
        // Tabla: rol
        Schema::create('rol', function (Blueprint $table) {
            $table->increments('cod_rol');
            $table->string('cargo', 45)->nullable();
        });

        // Tabla: estado_usuario
        Schema::create('estado_usuario', function (Blueprint $table) {
            $table->increments('cod_estado_usuario');
            $table->string('estado', 45)->nullable();
        });

        // Tabla: usuario
        Schema::create('usuario', function (Blueprint $table) {
            $table->string('documento', 20)->primary();
            $table->string('nombre', 45)->nullable();
            $table->string('apellido', 45)->nullable();
            $table->unsignedInteger('cod_rol')->nullable();
            $table->unsignedInteger('cod_estado_usuario')->default(1);
            $table->string('password', 255)->nullable();
            $table->foreign('cod_rol')->references('cod_rol')->on('rol');
            $table->foreign('cod_estado_usuario')->references('cod_estado_usuario')->on('estado_usuario');
            $table->index('cod_rol');
            $table->index('cod_estado_usuario');
        });

        // Tabla: correo
        Schema::create('correo', function (Blueprint $table) {
            $table->string('correo', 100)->primary();
            $table->string('documento', 20)->nullable();
            $table->foreign('documento')->references('documento')->on('usuario');
            $table->index('documento');
        });

        // Tabla: telefono
        Schema::create('telefono', function (Blueprint $table) {
            $table->string('telefono', 20)->primary();
            $table->string('documento', 20)->nullable();
            $table->foreign('documento')->references('documento')->on('usuario');
            $table->index('documento');
        });

        // Tabla: estado_elemento
        Schema::create('estado_elemento', function (Blueprint $table) {
            $table->increments('cod_estado_elemento');
            $table->string('estado', 45)->nullable();
        });

        // Tabla: tipo_elemento
        Schema::create('tipo_elemento', function (Blueprint $table) {
            $table->increments('cod_tipo_elemento');
            $table->string('tipo', 45)->nullable();
        });

        // Tabla: ubi_elemento
        Schema::create('ubi_elemento', function (Blueprint $table) {
            $table->increments('cod_ubi_elemento');
            $table->string('ubicacion', 45)->nullable();
        });

        // Tabla: inventario
        Schema::create('inventario', function (Blueprint $table) {
            $table->increments('id_elemento');
            $table->string('cod_elemento', 45)->nullable();
            $table->string('elemento', 100)->nullable();
            $table->unsignedInteger('cod_tipo_elemento')->nullable();
            $table->unsignedInteger('cod_estado_elemento')->nullable();
            $table->unsignedInteger('cod_ubi_elemento')->nullable();
            $table->foreign('cod_tipo_elemento')->references('cod_tipo_elemento')->on('tipo_elemento');
            $table->foreign('cod_estado_elemento')->references('cod_estado_elemento')->on('estado_elemento');
            $table->foreign('cod_ubi_elemento')->references('cod_ubi_elemento')->on('ubi_elemento');
            $table->index('cod_tipo_elemento');
            $table->index('cod_estado_elemento');
            $table->index('cod_ubi_elemento');
        });

        // Tabla: tipo_mantenimiento
        Schema::create('tipo_mantenimiento', function (Blueprint $table) {
            $table->increments('cod_tipo_mantenimiento');
            $table->string('tipo', 45)->nullable();
        });

        // Tabla: mantenimiento
        Schema::create('mantenimiento', function (Blueprint $table) {
            $table->increments('id_mantenimiento');
            $table->date('fecha')->nullable();
            $table->unsignedInteger('cod_tipo_mantenimiento')->nullable();
            $table->string('documento', 20)->nullable();
            $table->string('elemento', 100)->nullable();
            $table->text('descripcion')->nullable();
            $table->foreign('cod_tipo_mantenimiento')->references('cod_tipo_mantenimiento')->on('tipo_mantenimiento');
            $table->foreign('documento')->references('documento')->on('usuario');
            $table->index('cod_tipo_mantenimiento');
            $table->index('documento');
        });

        // Tabla: estado_reserva
        Schema::create('estado_reserva', function (Blueprint $table) {
            $table->increments('Num_estado');
            $table->string('estado', 45)->nullable();
        });

        // Tabla: Reserva
        Schema::create('Reserva', function (Blueprint $table) {
            $table->increments('id_Reserva');
            $table->unsignedInteger('Num_estado')->nullable();
            $table->string('documento', 20)->nullable();
            $table->date('fecha')->nullable();
            $table->date('plazo')->nullable();
            $table->integer('cantidad')->nullable();
            $table->string('elemento', 100)->nullable();
            $table->foreign('Num_estado')->references('Num_estado')->on('estado_reserva');
            $table->foreign('documento')->references('documento')->on('usuario');
            $table->index('Num_estado');
            $table->index('documento');
        });

        // Tabla: estado_prestamo
        Schema::create('estado_prestamo', function (Blueprint $table) {
            $table->increments('cod_estado_prestamo');
            $table->string('estado', 45)->nullable();
        });

        // Tabla: prestamo
        Schema::create('prestamo', function (Blueprint $table) {
            $table->unsignedInteger('id_Reserva')->primary();
            $table->unsignedInteger('cod_estado_prestamo')->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_entrega')->nullable();
            $table->integer('cantidad')->nullable();
            $table->foreign('id_Reserva')->references('id_Reserva')->on('Reserva');
            $table->foreign('cod_estado_prestamo')->references('cod_estado_prestamo')->on('estado_prestamo');
            $table->index('cod_estado_prestamo');
        });

        // Tabla: cantidad
        Schema::create('cantidad', function (Blueprint $table) {
            $table->increments('id_cantidad');
            $table->unsignedInteger('id_Reserva')->nullable();
            $table->unsignedInteger('id_elemento')->nullable();
            $table->string('codigo', 45)->nullable();
            $table->foreign('id_Reserva')->references('id_Reserva')->on('Reserva');
            $table->foreign('id_elemento')->references('id_elemento')->on('inventario');
            $table->index('id_Reserva');
            $table->index('id_elemento');
        });

        //  VIEWs =====================

        DB::statement('
            CREATE VIEW v_ingreso_login AS
            SELECT 
                u.documento,
                u.password,
                u.cod_rol,
                r.cargo AS rol,
                u.cod_estado_usuario,
                eu.estado AS estado_usuario
            FROM usuario u
            LEFT JOIN rol r ON u.cod_rol = r.cod_rol
            LEFT JOIN estado_usuario eu ON u.cod_estado_usuario = eu.cod_estado_usuario
        ');

        DB::statement('
            CREATE VIEW v_usuarios_completos AS
            SELECT 
                u.documento,
                u.nombre,
                u.apellido,
                u.cod_rol,
                r.cargo AS rol,
                u.cod_estado_usuario,
                eu.estado AS estado_usuario,
                c.correo,
                t.telefono
            FROM usuario u
            LEFT JOIN rol r ON u.cod_rol = r.cod_rol
            LEFT JOIN estado_usuario eu ON u.cod_estado_usuario = eu.cod_estado_usuario
            LEFT JOIN correo c ON u.documento = c.documento
            LEFT JOIN telefono t ON u.documento = t.documento
        ');

        DB::statement('
            CREATE VIEW v_historial_prestamos AS
            SELECT 
                p.id_Reserva,
                ep.estado AS estado_prestamo,
                p.fecha_inicio,
                p.fecha_entrega,
                r.elemento,
                r.cantidad,
                u.documento,
                u.nombre,
                u.apellido
            FROM prestamo p
            LEFT JOIN estado_prestamo ep ON p.cod_estado_prestamo = ep.cod_estado_prestamo
            LEFT JOIN Reserva r ON p.id_Reserva = r.id_Reserva
            LEFT JOIN usuario u ON r.documento = u.documento
        ');

        DB::statement('
            CREATE VIEW v_historial_reservas AS
            SELECT 
                r.id_Reserva,
                er.estado AS estado_reserva,
                r.fecha,
                r.plazo,
                r.elemento,
                r.cantidad,
                u.documento,
                u.nombre,
                u.apellido
            FROM Reserva r
            LEFT JOIN estado_reserva er ON r.Num_estado = er.Num_estado
            LEFT JOIN usuario u ON r.documento = u.documento
        ');

        //  STORED PROCEDURES =====================

        DB::unprepared('
            CREATE PROCEDURE IF NOT EXISTS sp_generar_usuarios()
            BEGIN
              DELETE FROM usuario WHERE documento >= 1000000001;
              DELETE FROM correo WHERE documento >= 1000000001;
              DELETE FROM telefono WHERE documento >= 1000000001;

              INSERT INTO usuario (documento, nombre, apellido, cod_rol, cod_estado_usuario, password) VALUES
              (1000000001, "Carlos", "López", 1, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000002, "María", "González", 1, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000003, "Pedro", "Martínez", 1, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000004, "Ana", "Sánchez", 1, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000005, "Jorge", "Ramírez", 1, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000006, "Laura", "Jiménez", 1, 2, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000007, "Francisco", "Hernández", 2, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000008, "Elena", "Vargas", 2, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000009, "David", "Flores", 2, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000010, "Sofía", "Gómez", 2, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000011, "Miguel", "Fuentes", 3, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa"),
              (1000000012, "Gabriela", "Medina", 3, 1, "$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa");

              INSERT INTO correo (correo, documento) VALUES
              ("carlos.lopez@gmail.com", 1000000001),
              ("maria.gonzalez@gmail.com", 1000000002),
              ("pedro.martinez@gmail.com", 1000000003),
              ("ana.sanchez@gmail.com", 1000000004),
              ("jorge.ramirez@gmail.com", 1000000005),
              ("laura.jimenez@gmail.com", 1000000006),
              ("francisco.hernandez@gmail.com", 1000000007),
              ("elena.vargas@gmail.com", 1000000008),
              ("david.flores@gmail.com", 1000000009),
              ("sofia.gomez@gmail.com", 1000000010),
              ("miguel.fuentes@gmail.com", 1000000011),
              ("gabriela.medina@gmail.com", 1000000012);

              INSERT INTO telefono (telefono, documento) VALUES
              ("3105551001", 1000000001),
              ("3105551002", 1000000002),
              ("3105551003", 1000000003),
              ("3105551004", 1000000004),
              ("3105551005", 1000000005),
              ("3105551006", 1000000006),
              ("3115551007", 1000000007),
              ("3115551008", 1000000008),
              ("3115551009", 1000000009),
              ("3115551010", 1000000010),
              ("3125551011", 1000000011),
              ("3125551012", 1000000012);
            END
        ');
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_historial_reservas');
        DB::statement('DROP VIEW IF EXISTS v_historial_prestamos');
        DB::statement('DROP VIEW IF EXISTS v_usuarios_completos');
        DB::statement('DROP VIEW IF EXISTS v_ingreso_login');
        DB::statement('DROP PROCEDURE IF EXISTS sp_generar_usuarios');
        
        Schema::dropIfExists('cantidad');
        Schema::dropIfExists('prestamo');
        Schema::dropIfExists('estado_prestamo');
        Schema::dropIfExists('Reserva');
        Schema::dropIfExists('estado_reserva');
        Schema::dropIfExists('mantenimiento');
        Schema::dropIfExists('tipo_mantenimiento');
        Schema::dropIfExists('inventario');
        Schema::dropIfExists('ubi_elemento');
        Schema::dropIfExists('tipo_elemento');
        Schema::dropIfExists('estado_elemento');
        Schema::dropIfExists('telefono');
        Schema::dropIfExists('correo');
        Schema::dropIfExists('usuario');
        Schema::dropIfExists('estado_usuario');
        Schema::dropIfExists('rol');
    }
};