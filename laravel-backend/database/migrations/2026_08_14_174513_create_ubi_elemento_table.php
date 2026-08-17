<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ubi_elemento', function (Blueprint $table) {
            $table->increments('cod_ubicacion');
            $table->string('ubicacion', 45)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ubi_elemento');
    }
};