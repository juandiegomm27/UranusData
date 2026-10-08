<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventarioMovimiento extends Model
{
    protected $table = 'inventario_movimientos';
    protected $primaryKey = 'id_movimiento';
    public $timestamps = false;

    protected $fillable = [
        'id_elemento',
        'tipo',
        'descripcion',
        'datos',
        'documento',
        'usuario',
        'fecha'
    ];

    protected $casts = [
        'datos' => 'array',
        'fecha' => 'datetime',
    ];
}