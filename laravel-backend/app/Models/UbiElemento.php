<?php 
namespace App\Models; 

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model; 

class UbiElemento extends Model 
{
    use HasFactory;
    
    protected $table = 'ubi_elemento';
    protected $primaryKey = 'cod_ubi_elemento';
    public $timestamps = false;
    
    protected $fillable = [
        'ubicacion'
    ];

    public function inventario() 
    {
        return $this->hasMany(Inventario::class, 'cod_ubi_elemento', 'cod_ubi_elemento');
    }
}