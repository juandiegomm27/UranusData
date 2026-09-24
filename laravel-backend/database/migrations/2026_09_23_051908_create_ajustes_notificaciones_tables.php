<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla de Preferencias (Ajustes)
        Schema::create('preferencias_usuario', function (Blueprint $table) {
            $table->string('documento', 10)->primary();
            $table->boolean('tema_oscuro')->default(false);
            $table->boolean('notificaciones_email')->default(true);
            $table->boolean('notificaciones_push')->default(true);
            $table->string('idioma', 5)->default('es');
            
            $table->foreign('documento')->references('documento')->on('usuario')->onDelete('cascade');
        });

        // Tabla de Notificaciones Internas
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id('id_notificacion');
            $table->string('documento', 10);
            $table->string('titulo', 150);
            $table->text('mensaje');
            $table->string('tipo', 20)->default('info'); // info, success, warning, error
            $table->boolean('leida')->default(false);
            $table->timestamp('fecha_creacion')->useCurrent();
            
            $table->foreign('documento')->references('documento')->on('usuario')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('preferencias_usuario');
    }
};