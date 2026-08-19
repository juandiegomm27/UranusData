<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VUsuariosCompletos extends Model
{
    protected $table = 'v_usuarios_completos';
    protected $primaryKey = 'documento';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';
}