<?php

namespace App\Models;
use App\Models\Rol;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $hidden = [
        'password',
    ];
    
    protected $table = 'usuario';
    protected $primaryKey = 'documento';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'documento',
        'nombre',
        'apellido',
        'cod_rol',
        'cod_estado_usuario',
        'password'
    ];

public function rol()
{
    return $this->belongsTo(\App\Models\Rol::class, 'cod_rol', 'cod_rol');
}

    public function estado()
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

    public function mantenimiento()
    {
        return $this->hasMany(Mantenimiento::class, 'documento', 'documento');
    }

    public function reserva()
    {
        return $this->hasMany(Reserva::class, 'documento', 'documento');
    }
}