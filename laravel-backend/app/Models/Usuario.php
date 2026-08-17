<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuario';
    protected $primaryKey = 'documento';
    public $timestamps = false;
    protected $fillable = ['documento', 'nombre', 'apellido', 'cod_rol', 'password', 'cod_estado_usuario'];

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'cod_rol', 'cod_rol');
    }

    public function estadoUsuario()
    {
        return $this->belongsTo(EstadoUsuario::class, 'cod_estado_usuario', 'cod_estado_usuario');
    }

    public function correos()
    {
        return $this->hasMany(Correo::class, 'documento', 'documento');
    }

    public function telefonos()
    {
        return $this->hasMany(Telefono::class, 'documento', 'documento');
    }

    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class, 'documento', 'documento');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'documento', 'documento');
    }
}
