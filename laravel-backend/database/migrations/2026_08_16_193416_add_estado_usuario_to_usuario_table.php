<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->unsignedInteger('cod_estado_usuario')->default(1)->after('cod_rol');
            $table->foreign('cod_estado_usuario')->references('cod_estado_usuario')->on('estado_usuario');
        });
    }

    public function down(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropForeign(['cod_estado_usuario']);
            $table->dropColumn('cod_estado_usuario');
        });
    }
};