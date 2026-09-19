<?php 
namespace App\Models; 
use Illuminate\Database\Eloquent\Model; 

class Inventario extends Model {
    protected $table = 'inventario';
    protected $primaryKey = 'id_elemento';
    public $timestamps = false;
    
    protected $fillable = [
        'cod_elemento',
        'nombre_elemento',
        'serial',
        'modelo',
        'descripcion',
        'cod_tipo_elemento',
        'cod_estado_elemento',
        'cod_ubi_elemento'
    ];

    public function estado() {
        return $this->belongsTo(EstadoElemento::class, 'cod_estado_elemento', 'cod_estado_elemento');
    }
    public function tipo() {
        return $this->belongsTo(TipoElemento::class, 'cod_tipo_elemento', 'cod_tipo_elemento');
    }
    public function ubicacion() {
        return $this->belongsTo(UbiElemento::class, 'cod_ubi_elemento', 'cod_ubi_elemento');
    }
    public function mantenimiento() {
        return $this->hasMany(Mantenimiento::class, 'id_elemento', 'id_elemento');
    }
    public function elementoInventario()
    {
        return $this->belongsTo(Inventario::class, 'id_elemento', 'id_elemento');
    }
}