<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('estado_mantenimiento')->updateOrInsert(
            ['cod_estado_mantenimiento' => 4],
            ['estado' => 'Dado de baja']
        );
    }

    public function down(): void
    {
        DB::table('estado_mantenimiento')->where('cod_estado_mantenimiento', 4)->delete();
    }
};