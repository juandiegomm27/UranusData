package com.uranusdata.inventario.accesorios.domain;

/** Existencias de un accesorio en una ubicación concreta. */
public record StockAccesorio(Integer idStock, Integer idAccesorio, Integer codUbiElemento,
                             Integer cantidadTotal, Integer cantidadDisponible) {}
