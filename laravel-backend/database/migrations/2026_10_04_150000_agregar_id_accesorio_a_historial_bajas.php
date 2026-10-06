<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('historial_bajas_general', function (Blueprint $table) {
            $table->unsignedInteger('id_accesorio')->nullable()->after('id_original');
        });
    }

    public function down(): void
    {
        Schema::table('historial_bajas_general', function (Blueprint $table) {
            $table->dropColumn('id_accesorio');
        });
    }
};