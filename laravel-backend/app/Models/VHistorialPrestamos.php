<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VHistorialPrestamos extends Model
{
    protected $table = 'v_historial_prestamos';
    protected $primaryKey = 'id_Reserva';
    public $timestamps = false;
    public $incrementing = false;
}