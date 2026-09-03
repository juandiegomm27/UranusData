<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoElemento extends Model
{
    protected $table = 'estado_elemento';
    protected $primaryKey = 'cod_estado';
    public $timestamps = false;
    protected $fillable = ['estado'];

    public function inventario()
    {
        return $this->hasMany(Inventario::class, 'cod_estado', 'cod_estado');
    }
}