<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estado_Reserva', function (Blueprint $table) {
            $table->increments('Num_estado');
            $table->string('estado', 45)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estado_Reserva');
    }
};
