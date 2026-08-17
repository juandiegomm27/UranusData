<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoMantenimiento extends Model
{
    protected $table = 'tipo_mantenimiento';
    protected $primaryKey = 'cod_tipo';
    public $timestamps = false;
    protected $fillable = ['tipo'];

    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class, 'tipo_cod_tipo', 'cod_tipo');
    }
}