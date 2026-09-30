<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventario', function (Blueprint $table) {
            $table->unsignedInteger('id_elemento_padre')->nullable()->after('cod_ubi_elemento');
            $table->index('id_elemento_padre');
            $table->foreign('id_elemento_padre')
                ->references('id_elemento')
                ->on('inventario')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventario', function (Blueprint $table) {
            $table->dropForeign(['id_elemento_padre']);
            $table->dropIndex(['id_elemento_padre']);
            $table->dropColumn('id_elemento_padre');
        });
    }
};