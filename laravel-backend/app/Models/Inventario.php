<?php

namespace App\Models;

use App\Observers\InventarioObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy([InventarioObserver::class])]
class Inventario extends Model
{
    public const ESTADO_ACTIVO = 1;
    public const ESTADO_EN_PRESTAMO = 2;
    public const ESTADO_MANTENIMIENTO = 3;
    public const ESTADO_BAJA = 4;

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
        'cod_marca',
        'cod_estado_elemento',
        'cod_ubi_elemento',
        'id_elemento_padre'
    ];

    public ?string $motivoMovimiento = null;

    public function scopeVisibles(Builder $query): Builder
    {
        return $query->where('cod_estado_elemento', '!=', self::ESTADO_BAJA);
    }

    public function estado()
    {
        return $this->belongsTo(EstadoElemento::class, 'cod_estado_elemento', 'cod_estado_elemento');
    }

    public function tipo()
    {
        return $this->belongsTo(TipoElemento::class, 'cod_tipo_elemento', 'cod_tipo_elemento');
    }

    public function marca()
    {
        return $this->belongsTo(Marca::class, 'cod_marca', 'cod_marca');
    }

    public function ubicacion()
    {
        return $this->belongsTo(UbiElemento::class, 'cod_ubi_elemento', 'cod_ubi_elemento');
    }

    public function mantenimiento()
    {
        return $this->hasMany(Mantenimiento::class, 'id_elemento', 'id_elemento');
    }

    public function padre()
    {
        return $this->belongsTo(Inventario::class, 'id_elemento_padre', 'id_elemento');
    }

    public function hijos()
    {
        return $this->hasMany(Inventario::class, 'id_elemento_padre', 'id_elemento');
    }

    public function reservaPendiente(): ?int
    {
        return ReservaDetalle::where('id_elemento', $this->id_elemento)
            ->whereHas('reserva', function ($q) {
                $q->where('Num_estado', 1)
                  ->where(function ($sub) {
                      $sub->whereDoesntHave('prestamo')
                          ->orWhereHas('prestamo', fn ($p) => $p->where('cod_estado_prestamo', 1));
                  });
            })
            ->value('id_Reserva');
    }
}