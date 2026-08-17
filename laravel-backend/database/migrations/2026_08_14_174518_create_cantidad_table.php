<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cantidad', function (Blueprint $table) {
            $table->unsignedInteger('id_Reserva');
            $table->unsignedInteger('id_elemento');
            $table->string('codigo', 10);
            
            $table->primary(['id_Reserva', 'id_elemento', 'codigo']);
            
            $table->foreign(['id_elemento', 'codigo'])
                ->references(['id_elemento', 'cod_elemento'])
                ->on('inventario');
            $table->foreign('id_Reserva')->references('id_Reserva')->on('prestamo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cantidad');
    }
};
