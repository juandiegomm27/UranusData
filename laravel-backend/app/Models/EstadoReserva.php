<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoReserva extends Model
{
    protected $table = 'estado_Reserva';
    protected $primaryKey = 'Num_estado';
    public $timestamps = false;
    protected $fillable = ['estado'];

    public function reserva()
    {
        return $this->hasMany(Reserva::class, 'Num_estado', 'Num_estado');
    }
}