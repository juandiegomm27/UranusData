<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Correo extends Model
{
    protected $table = 'correo';
    protected $primaryKey = 'correo';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['correo', 'documento'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'documento', 'documento');
    }

    public function toArray()
    {
        return [
            'correo' => (string)$this->attributes['correo'],
            'documento' => (int)$this->attributes['documento'],
        ];
    }
}