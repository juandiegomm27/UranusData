<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipo_elemento', function (Blueprint $table) {
            $table->increments('cod_tipo');
            $table->string('tipo', 45)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipo_elemento');
    }
};