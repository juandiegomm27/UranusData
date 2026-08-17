<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'rol';
    protected $primaryKey = 'cod_rol';
    public $timestamps = false;
    protected $fillable = ['cargo'];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'cod_rol', 'cod_rol');
    }
}
