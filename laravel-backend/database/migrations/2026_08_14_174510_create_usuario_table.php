<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario', function (Blueprint $table) {
            $table->integer('documento')->primary();
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->unsignedInteger('cod_rol');
            
            $table->foreign('cod_rol')->references('cod_rol')->on('rol');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario');
    }
};