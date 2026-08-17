<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Reserva', function (Blueprint $table) {
            $table->increments('id_Reserva');
            $table->unsignedInteger('Num_estado');
            $table->integer('documento');
            $table->date('fecha')->nullable();
            $table->date('plazo')->nullable();
            $table->integer('cantidad')->nullable();
            $table->string('elemento', 45)->nullable();
            
            $table->foreign('documento')->references('documento')->on('usuario');
            $table->foreign('Num_estado')->references('Num_estado')->on('estado_Reserva');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Reserva');
    }
};
