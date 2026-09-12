<?php 
namespace App\Models; 
use Illuminate\Database\Eloquent\Model; 

class TipoElemento extends Model {
    protected $table = 'tipo_elemento';
    protected $primaryKey = 'cod_tipo_elemento';
    public $timestamps = false;
    protected $fillable = ['tipo'];

    public function inventario() {
        return $this->hasMany(Inventario::class, 'cod_tipo_elemento', 'cod_tipo_elemento');
    }
}