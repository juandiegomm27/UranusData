<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoUsuario extends Model
{
    protected $table = 'estado_usuario';
    protected $primaryKey = 'cod_estado_usuario';
    public $timestamps = false;
    protected $fillable = ['estado'];

    public function usuario()
    {
        return $this->hasMany(Usuario::class, 'cod_estado_usuario', 'cod_estado_usuario');
    }
}