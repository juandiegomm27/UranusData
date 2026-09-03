<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventario extends Model
{
    protected $table = 'inventario';
    protected $primaryKey = 'id_elemento';
    public $timestamps = false;
    protected $fillable = ['id_elemento', 'cod_elemento', 'No_ubicacion', 'cod_tipo', 'cod_estado', 'marca'];

    public function estado()
    {
        return $this->belongsTo(EstadoElemento::class, 'cod_estado', 'cod_estado');
    }

    public function tipo()
    {
        return $this->belongsTo(TipoElemento::class, 'cod_tipo', 'cod_tipo');
    }

    public function ubicacion()
    {
        return $this->belongsTo(UbiElemento::class, 'No_ubicacion', 'cod_ubicacion');
    }

    public function mantenimiento()
    {
        return $this->hasMany(Mantenimiento::class, 'id_elemento', 'id_elemento');
    }

    public function cantidades()
    {
        return $this->hasMany(Cantidad::class, 'id_elemento', 'id_elemento');
    }
}