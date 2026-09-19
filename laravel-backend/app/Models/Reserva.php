<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model {
    protected $table = 'Reserva';
    protected $primaryKey = 'id_Reserva';
    public $timestamps = false;
    
    // Eliminamos 'cantidad' y 'elemento'
    protected $fillable = ['Num_estado', 'documento', 'fecha', 'plazo'];

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'documento', 'documento');
    }
    public function estado() {
        return $this->belongsTo(EstadoReserva::class, 'Num_estado', 'Num_estado');
    }
    public function prestamo() {
        return $this->hasOne(Prestamo::class, 'id_Reserva', 'id_Reserva');
    }
    // Nueva relaci n hacia los detalles
    public function detalles() {
        return $this->hasMany(ReservaDetalle::class, 'id_Reserva', 'id_Reserva');
    }
}