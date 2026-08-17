<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rol', function (Blueprint $table) {
            $table->increments('cod_rol');
            $table->string('cargo', 45)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rol');
    }
};