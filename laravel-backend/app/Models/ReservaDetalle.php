<?php 
namespace App\Models; 
use Illuminate\Database\Eloquent\Model; 

class ReservaDetalle extends Model {
    protected $table = 'reserva_detalles';
    protected $primaryKey = 'id_detalle';
    public $timestamps = false;
    
    protected $fillable = [
        'id_Reserva', 
        'id_elemento', 
        'id_stock', 
        'cantidad_solicitada', 
        'cantidad_entregada', 
        'cantidad_devuelta'
    ];

    public function reserva() {
        return $this->belongsTo(Reserva::class, 'id_Reserva', 'id_Reserva');
    }
    
    public function elemento() {
        return $this->belongsTo(Inventario::class, 'id_elemento', 'id_elemento');
    }
    
    // <--- NUEVA RELACIÓN: Apunta directamente al stock de donde se sacó
    public function stock() {
        return $this->belongsTo(StockAccesorio::class, 'id_stock', 'id_stock');
    }
}