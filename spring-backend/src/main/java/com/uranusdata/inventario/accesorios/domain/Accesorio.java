package com.uranusdata.inventario.accesorios.domain;

/** Representa un accesorio y las cantidades agregadas de todas sus ubicaciones. */
public record Accesorio(Integer idAccesorio, String nombre, String modelo, String descripcion,
                        Integer codTipoElemento, Integer codMarca,
                        Integer cantidadTotal, Integer cantidadDisponible) {}
