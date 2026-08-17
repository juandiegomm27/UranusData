<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UbiElemento extends Model
{
    protected $table = 'ubi_elemento';
    protected $primaryKey = 'cod_ubicacion';
    public $timestamps = false;
    protected $fillable = ['ubicacion'];

    public function inventarios()
    {
        return $this->hasMany(Inventario::class, 'No_ubicacion', 'cod_ubicacion');
    }
}