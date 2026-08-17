<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mantenimiento extends Model
{
    protected $table = 'mantenimiento';
    protected $primaryKey = 'No_mantenimiento';
    public $timestamps = false;
    protected $fillable = ['No_mantenimiento', 'id_elemento', 'cod_elemento', 'tipo_cod_tipo', 'documento', 'descripcion'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'documento', 'documento');
    }

    public function tipo()
    {
        return $this->belongsTo(TipoMantenimiento::class, 'tipo_cod_tipo', 'cod_tipo');
    }

    public function inventario()
    {
        return $this->belongsTo(Inventario::class, 'id_elemento', 'id_elemento');
    }
}