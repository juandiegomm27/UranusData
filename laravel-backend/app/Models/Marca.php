<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Marca extends Model
{
    protected $table = 'marca';
    protected $primaryKey = 'cod_marca';
    public $timestamps = false;
    protected $fillable = ['marca'];

    public function inventario()
    {
        return $this->hasMany(Inventario::class, 'cod_marca', 'cod_marca');
    }

    public function accesorios()
    {
        return $this->hasMany(InventarioAccesorio::class, 'cod_marca', 'cod_marca');
    }
}