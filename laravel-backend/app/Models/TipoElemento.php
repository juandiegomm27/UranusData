<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoElemento extends Model
{
    protected $table = 'tipo_elemento';
    protected $primaryKey = 'cod_tipo';
    public $timestamps = false;
    protected $fillable = ['tipo'];

    public function inventarios()
    {
        return $this->hasMany(Inventario::class, 'cod_tipo', 'cod_tipo');
    }
}