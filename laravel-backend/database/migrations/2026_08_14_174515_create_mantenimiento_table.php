<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mantenimiento', function (Blueprint $table) {
            $table->increments('No_mantenimiento');
            $table->unsignedInteger('id_elemento');
            $table->string('cod_elemento', 10);
            $table->unsignedInteger('tipo_cod_tipo');
            $table->integer('documento');
            $table->string('descripcion', 255)->nullable();
            
            $table->unique(['No_mantenimiento', 'id_elemento', 'cod_elemento']);
            
            $table->foreign('documento')->references('documento')->on('usuario');
            $table->foreign('tipo_cod_tipo')->references('cod_tipo')->on('tipo_mantenimiento');
            $table->foreign(['id_elemento', 'cod_elemento'])
                ->references(['id_elemento', 'cod_elemento'])
                ->on('inventario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mantenimiento');
    }
};
