<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VHistorialReservas extends Model
{
    protected $table = 'v_historial_reservas';
    protected $primaryKey = 'id_Reserva';
    public $timestamps = false;
    public $incrementing = false;
}