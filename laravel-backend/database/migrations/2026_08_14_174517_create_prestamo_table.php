<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prestamo', function (Blueprint $table) {
            $table->unsignedInteger('id_Reserva')->primary();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_entrega')->nullable();
            $table->integer('cantidad');
            
            $table->foreign('id_Reserva')->references('id_Reserva')->on('Reserva');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestamo');
    }
};
