<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VIngresoLogin extends Model
{
    protected $table = 'v_ingreso_login';
    protected $primaryKey = 'documento';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';
}