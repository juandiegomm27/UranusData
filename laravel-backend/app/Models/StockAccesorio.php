<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockAccesorio extends Model
{
    protected $table = 'stock_accesorios';
    protected $primaryKey = 'id_stock';
    public $timestamps = false;

    protected $fillable = [
        'id_accesorio',
        'cod_ubi_elemento',
        'cantidad_total',
        'cantidad_disponible'
    ];

    public function ubicacion()
    {
        return $this->belongsTo(UbiElemento::class, 'cod_ubi_elemento', 'cod_ubi_elemento');
    }

    public function accesorio()
    {
        return $this->belongsTo(InventarioAccesorio::class, 'id_accesorio', 'id_accesorio');
    }
}