<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolSeeder::class,           
            EstadoUsuarioSeeder::class, 
            CatalogosSeeder::class,     
            UsuarioSeeder::class, 
            InventarioSeeder::class, 
            ReservaSeeder::class,
            PrestamoSeeder::class,
        ]);
    }
}