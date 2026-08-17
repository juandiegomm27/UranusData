<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prestamo extends Model
{
    protected $table = 'prestamo';
    protected $primaryKey = 'id_Reserva';
    public $timestamps = false;
    protected $fillable = ['id_Reserva', 'fecha_inicio', 'fecha_entrega', 'cantidad'];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_Reserva', 'id_Reserva');
    }

    public function cantidades()
    {
        return $this->hasMany(Cantidad::class, 'id_Reserva', 'id_Reserva');
    }
}