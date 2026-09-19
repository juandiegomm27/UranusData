<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('rol')) {
            return;
        }
        
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
            $table->foreign('documento')->references('documento')->on('usuario')->onDelete('cascade');
            $table->index('documento');
        });

        // Tabla: telefono
        Schema::create('telefono', function (Blueprint $table) {
            $table->string('telefono', 20)->primary();
            $table->string('documento', 20)->nullable();
            $table->foreign('documento')->references('documento')->on('usuario')->onDelete('cascade');
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

        // Tabla: inventario (SOLO PARA ACTIVOS FIJOS / ÚNICOS)
        Schema::create('inventario', function (Blueprint $table) {
            $table->increments('id_elemento');
            $table->string('cod_elemento', 45)->nullable();
            $table->string('nombre_elemento', 100)->nullable(); 
            $table->string('serial', 100)->nullable();          
            $table->string('modelo', 100)->nullable();          
            $table->text('descripcion')->nullable();            
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

        // NUEVA Tabla: inventario_accesorios (CATÁLOGO GLOBAL)
        Schema::create('inventario_accesorios', function (Blueprint $table) {
            $table->increments('id_accesorio');
            $table->string('nombre', 100);
            $table->string('modelo', 100)->nullable(); // <--- AÑADIDO: Modelo
            $table->text('descripcion')->nullable();
            $table->unsignedInteger('cod_tipo_elemento')->nullable();
            
            // Totales Globales del accesorio (Sumatoria de todas las ubicaciones)
            $table->integer('cantidad_total')->default(0); 
            $table->integer('cantidad_disponible')->default(0);
            
            $table->foreign('cod_tipo_elemento')->references('cod_tipo_elemento')->on('tipo_elemento');
            $table->index('cod_tipo_elemento');
        });

        // NUEVA Tabla: stock_accesorios (CANTIDADES POR UBICACIÓN)
        Schema::create('stock_accesorios', function (Blueprint $table) {
            $table->increments('id_stock');
            $table->unsignedInteger('id_accesorio');
            $table->unsignedInteger('cod_ubi_elemento');
            
            // Cantidades específicas en ESTA ubicación
            $table->integer('cantidad_total')->default(0);
            $table->integer('cantidad_disponible')->default(0);

            $table->foreign('id_accesorio')->references('id_accesorio')->on('inventario_accesorios')->onDelete('cascade');
            $table->foreign('cod_ubi_elemento')->references('cod_ubi_elemento')->on('ubi_elemento');
            
            // Un accesorio no puede tener dos registros separados en la misma sala (se suman)
            $table->unique(['id_accesorio', 'cod_ubi_elemento']);
            $table->index('id_accesorio');
            $table->index('cod_ubi_elemento');
        });

        // Tabla: tipo_mantenimiento
        Schema::create('tipo_mantenimiento', function (Blueprint $table) {
            $table->increments('cod_tipo_mantenimiento');
            $table->string('tipo', 45)->nullable();
        });

        // Tabla: estado_mantenimiento
        Schema::create('estado_mantenimiento', function (Blueprint $table) {
            $table->increments('cod_estado_mantenimiento');
            $table->string('estado', 50); 
        });

        // Tabla: mantenimiento
        Schema::create('mantenimiento', function (Blueprint $table) {
            $table->increments('id_mantenimiento');
            $table->date('fecha')->nullable();
            $table->unsignedInteger('cod_tipo_mantenimiento')->nullable();
            $table->string('documento', 20)->nullable();
            $table->string('elemento', 100)->nullable();
            $table->unsignedInteger('id_elemento')->nullable();
            $table->string('serial', 50)->nullable();
            $table->text('descripcion')->nullable();
            $table->text('observaciones')->nullable();
            $table->unsignedInteger('cod_estado_mantenimiento')->default(1);

            $table->foreign('id_elemento')->references('id_elemento')->on('inventario');
            $table->foreign('cod_estado_mantenimiento')->references('cod_estado_mantenimiento')->on('estado_mantenimiento');
            $table->foreign('cod_tipo_mantenimiento')->references('cod_tipo_mantenimiento')->on('tipo_mantenimiento');
            $table->foreign('documento')->references('documento')->on('usuario');
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
            
            $table->foreign('Num_estado')->references('Num_estado')->on('estado_reserva');
            $table->foreign('documento')->references('documento')->on('usuario');
            $table->index('Num_estado');
            $table->index('documento');
        });

        // Tabla: reserva_detalles 
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
            $table->date('fecha_entrega_original')->nullable();
            $table->date('fecha_limite_actual')->nullable();
            $table->boolean('extension_aprobada')->default(false);
            
            $table->foreign('id_Reserva')->references('id_Reserva')->on('Reserva')->onDelete('cascade');
            $table->foreign('cod_estado_prestamo')->references('cod_estado_prestamo')->on('estado_prestamo');
            $table->index('cod_estado_prestamo');
        });

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

        // VIEWs
        DB::statement('DROP VIEW IF EXISTS v_historial_reservas');
        DB::statement('DROP VIEW IF EXISTS v_historial_prestamos');
        DB::statement('DROP VIEW IF EXISTS v_usuarios_completos');
        DB::statement('DROP VIEW IF EXISTS v_ingreso_login');

        DB::statement('
            CREATE VIEW v_ingreso_login AS
            SELECT 
                u.documento, u.password, u.cod_rol, r.cargo AS rol, u.cod_estado_usuario, eu.estado AS estado_usuario
            FROM usuario u
            LEFT JOIN rol r ON u.cod_rol = r.cod_rol
            LEFT JOIN estado_usuario eu ON u.cod_estado_usuario = eu.cod_estado_usuario
        ');

        DB::statement('
            CREATE VIEW v_usuarios_completos AS
            SELECT 
                u.documento, u.nombre, u.apellido, u.cod_rol, r.cargo AS rol, 
                u.cod_estado_usuario, eu.estado AS estado_usuario, c.correo, t.telefono
            FROM usuario u
            LEFT JOIN rol r ON u.cod_rol = r.cod_rol
            LEFT JOIN estado_usuario eu ON u.cod_estado_usuario = eu.cod_estado_usuario
            LEFT JOIN correo c ON u.documento = c.documento
            LEFT JOIN telefono t ON u.documento = t.documento
        ');

        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            $concatSql = 'group_concat(COALESCE(i.nombre_elemento, a.nombre), ", ")';
        } else {
            $concatSql = 'GROUP_CONCAT(COALESCE(i.nombre_elemento, a.nombre) SEPARATOR ", ")';
        }

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
        DB::statement('DROP VIEW IF EXISTS v_usuarios_completos');
        DB::statement('DROP VIEW IF EXISTS v_ingreso_login');
        
        Schema::dropIfExists('reserva_detalles');
        Schema::dropIfExists('prestamo');
        Schema::dropIfExists('estado_prestamo');
        Schema::dropIfExists('Reserva');
        Schema::dropIfExists('estado_reserva');
        Schema::dropIfExists('mantenimiento');
        Schema::dropIfExists('estado_mantenimiento');
        Schema::dropIfExists('tipo_mantenimiento');
        Schema::dropIfExists('stock_accesorios'); 
        Schema::dropIfExists('inventario_accesorios');
        Schema::dropIfExists('inventario');
        Schema::dropIfExists('ubi_elemento');
        Schema::dropIfExists('tipo_elemento');
        Schema::dropIfExists('estado_elemento');
        Schema::dropIfExists('telefono');
        Schema::dropIfExists('correo');
        Schema::dropIfExists('usuario');
        Schema::dropIfExists('estado_usuario');
        Schema::dropIfExists('rol');
        Schema::dropIfExists('historial_bajas_general');
    }
};