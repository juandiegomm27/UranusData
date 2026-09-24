<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreferenciaUsuario extends Model
{
    protected $table = 'preferencias_usuario';
    protected $primaryKey = 'documento';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'documento', 'tema_oscuro', 'notificaciones_email', 'notificaciones_push', 'idioma'
    ];
}