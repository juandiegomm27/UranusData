<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mantenimiento extends Model
{
    protected $table = 'mantenimiento';
    protected $primaryKey = 'id_mantenimiento';
    
    // ESTA LÍNEA APAGA LA INSERCIÓN AUTOMÁTICA DE TIMESTAMPS Y EVITA EL ERROR
    public $timestamps = false;

    protected $fillable = [
        'fecha',
        'cod_tipo_mantenimiento',
        'documento',
        'elemento',
        'id_elemento',
        'serial',
        'descripcion',
        'observaciones',
        'cod_estado_mantenimiento'
    ];

    public function tipo()
    {
        return $this->belongsTo(TipoMantenimiento::class, 'cod_tipo_mantenimiento', 'cod_tipo_mantenimiento');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'documento', 'documento');
    }

    public function elementoInventario()
    {
        return $this->belongsTo(Inventario::class, 'id_elemento', 'id_elemento');
    }
}