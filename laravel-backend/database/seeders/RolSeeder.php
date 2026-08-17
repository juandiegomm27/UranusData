<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public function run(): void
{
    \App\Models\Rol::create(['cargo' => 'Docente']);
    \App\Models\Rol::create(['cargo' => 'Tecnico']);
    \App\Models\Rol::create(['cargo' => 'Gerente']);
}
}
