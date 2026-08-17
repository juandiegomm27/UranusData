<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('correo', function (Blueprint $table) {
            $table->string('correo', 50)->primary();
            $table->integer('documento');
            
            $table->foreign('documento')->references('documento')->on('usuario')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('correo');
    }
};