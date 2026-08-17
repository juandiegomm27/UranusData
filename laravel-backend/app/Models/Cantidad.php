<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cantidad extends Model
{
    protected $table = 'cantidad';
    public $timestamps = false;
    protected $fillable = ['id_Reserva', 'id_elemento', 'codigo'];

    public function prestamo()
    {
        return $this->belongsTo(Prestamo::class, 'id_Reserva', 'id_Reserva');
    }

    public function inventario()
    {
        return $this->belongsTo(Inventario::class, 'id_elemento', 'id_elemento');
    }
}