<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventario', function (Blueprint $table) {
            $table->increments('id_elemento');
            $table->string('cod_elemento', 10);
            $table->unsignedInteger('No_ubicacion');
            $table->unsignedInteger('cod_tipo');
            $table->unsignedInteger('cod_estado');
            $table->string('marca', 45)->nullable();
            
            $table->unique(['id_elemento', 'cod_elemento']);
            
            $table->foreign('No_ubicacion')->references('cod_ubicacion')->on('ubi_elemento');
            $table->foreign('cod_tipo')->references('cod_tipo')->on('tipo_elemento');
            $table->foreign('cod_estado')->references('cod_estado')->on('estado_elemento');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventario');
    }
};