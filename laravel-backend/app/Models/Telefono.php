<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Telefono extends Model
{
    protected $table = 'telefono';
    protected $primaryKey = 'telefono';
    public $timestamps = false;
    protected $fillable = ['telefono', 'documento'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'documento', 'documento');
    }
}