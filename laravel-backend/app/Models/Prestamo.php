<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prestamo extends Model {
    protected $table = 'prestamo';
    protected $primaryKey = 'id_Reserva';
    public $timestamps = false;
    
    // Actualizamos con los campos de extensi n y fechas
    protected $fillable = [
        'id_Reserva', 'cod_estado_prestamo', 'fecha_inicio', 
        'fecha_entrega_original', 'fecha_limite_actual', 'extension_aprobada'
    ];

    public function reserva() {
        return $this->belongsTo(Reserva::class, 'id_Reserva', 'id_Reserva');
    }
    
}