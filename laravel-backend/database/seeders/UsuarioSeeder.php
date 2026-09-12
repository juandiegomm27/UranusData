<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;
use App\Models\Correo;
use App\Models\Telefono;
use App\Models\EstadoUsuario;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // Aseguramos que los estados existan primero
        EstadoUsuario::firstOrCreate(['cod_estado_usuario' => 1], ['estado' => 'Activo']);
        EstadoUsuario::firstOrCreate(['cod_estado_usuario' => 2], ['estado' => 'Inactivo']);
        EstadoUsuario::firstOrCreate(['cod_estado_usuario' => 3], ['estado' => 'Bloqueado']);

        $password = Hash::make('1234567890');

        // 1. Tus 3 usuarios principales de prueba
        $usuariosPrincipales = [
            ['doc' => 1234567890, 'nombre' => 'Juan Diego', 'apellido' => 'Medina Mahecha', 'rol' => 1], // Docente
            ['doc' => 1234567891, 'nombre' => 'Juan Diego', 'apellido' => 'Medina Mahecha', 'rol' => 2], // Tecnico
            ['doc' => 1234567892, 'nombre' => 'Juan Diego', 'apellido' => 'Medina Mahecha', 'rol' => 3], // Gerente
        ];

        foreach ($usuariosPrincipales as $u) {
            Usuario::insertOrIgnore([
                'documento' => $u['doc'], 'nombre' => $u['nombre'], 'apellido' => $u['apellido'], 
                'cod_rol' => $u['rol'], 'cod_estado_usuario' => 1, 'password' => $password
            ]);
            Correo::insertOrIgnore(['correo' => $u['doc'].'@gmail.com', 'documento' => $u['doc']]);
        }

        // 2. Los 12 usuarios fijos del sistema
        $usuariosFijos = [
            [1000000001, 'Carlos', 'López', 1, 1, 'carlos.lopez@gmail.com', '3105551001'],
            [1000000002, 'María', 'González', 1, 1, 'maria.gonzalez@gmail.com', '3105551002'],
            [1000000003, 'Pedro', 'Martínez', 1, 1, 'pedro.martinez@gmail.com', '3105551003'],
            [1000000004, 'Ana', 'Sánchez', 1, 1, 'ana.sanchez@gmail.com', '3105551004'],
            [1000000005, 'Jorge', 'Ramírez', 1, 1, 'jorge.ramirez@gmail.com', '3105551005'],
            [1000000006, 'Laura', 'Jiménez', 1, 2, 'laura.jimenez@gmail.com', '3105551006'], 
            [1000000007, 'Francisco', 'Hernández', 2, 1, 'francisco.hernandez@gmail.com', '3115551007'],
            [1000000008, 'Elena', 'Vargas', 2, 1, 'elena.vargas@gmail.com', '3115551008'],
            [1000000009, 'David', 'Flores', 2, 1, 'david.flores@gmail.com', '3115551009'],
            [1000000010, 'Sofía', 'Gómez', 2, 1, 'sofia.gomez@gmail.com', '3115551010'],
            [1000000011, 'Miguel', 'Fuentes', 3, 1, 'miguel.fuentes@gmail.com', '3125551011'],
            [1000000012, 'Gabriela', 'Medina', 3, 1, 'gabriela.medina@gmail.com', '3125551012'],
        ];

        foreach ($usuariosFijos as $u) {
            Usuario::insertOrIgnore([
                'documento' => $u[0], 'nombre' => $u[1], 'apellido' => $u[2],
                'cod_rol' => $u[3], 'cod_estado_usuario' => $u[4], 'password' => $password
            ]);
            Correo::insertOrIgnore(['correo' => $u[5], 'documento' => $u[0]]);
            Telefono::insertOrIgnore(['telefono' => $u[6], 'documento' => $u[0]]);
        }
    }
}