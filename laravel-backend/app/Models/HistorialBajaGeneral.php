<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistorialBajaGeneral extends Model
{
    use HasFactory;

    protected $table = 'historial_bajas_general';
    protected $primaryKey = 'id_baja';
    public $timestamps = false;

    // AÑADE LOS CAMPOS FALTANTES AQUÍ
    protected $fillable = [
        'tipo_item',
        'id_original',
        'nombre',
        'codigo_identificacion',
        'modelo',
        'descripcion',
        'cantidad',
        'cod_tipo_elemento',
        'cod_ubi_elemento',
        'ubicacion',
        'motivo',
        'fecha_baja'
    ];
}