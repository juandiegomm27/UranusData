<?php 
namespace App\Models; 
use Illuminate\Database\Eloquent\Model; 

class InventarioAccesorio extends Model {
    protected $table = 'inventario_accesorios';
    protected $primaryKey = 'id_accesorio';
    public $timestamps = false;
    
    protected $fillable = [
        'nombre', 
        'modelo',
        'descripcion', 
        'cod_tipo_elemento',
        'cod_marca',
        'cantidad_total', 
        'cantidad_disponible'
    ];

    public function tipo() {
        return $this->belongsTo(TipoElemento::class, 'cod_tipo_elemento', 'cod_tipo_elemento');
    }

    public function marca() {
        return $this->belongsTo(Marca::class, 'cod_marca', 'cod_marca');
    }

    public function stocks() {
        return $this->hasMany(StockAccesorio::class, 'id_accesorio', 'id_accesorio');
    }
}