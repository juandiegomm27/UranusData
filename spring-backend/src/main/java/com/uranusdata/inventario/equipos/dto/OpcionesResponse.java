package com.uranusdata.inventario.equipos.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Los cuatro catálogos que llenan los desplegables de la pantalla de
 * inventario, en una sola respuesta.
 *
 * Van juntos a propósito: la pantalla los necesita los cuatro antes de pintar
 * la tabla, porque resuelve los nombres de tipo, estado y ubicación contra
 * estas listas. Cuatro llamadas sueltas serían cuatro viajes para lo mismo.
 */
public record OpcionesResponse(
        List<Tipo> tipos,
        List<Marca> marcas,
        List<Estado> estados,
        List<Ubicacion> ubicaciones) {

    public record Tipo(@JsonProperty("cod_tipo_elemento") Integer cod, String tipo) {
    }

    public record Marca(@JsonProperty("cod_marca") Integer cod, String marca) {
    }

    public record Estado(@JsonProperty("cod_estado_elemento") Integer cod, String estado) {
    }

    public record Ubicacion(@JsonProperty("cod_ubi_elemento") Integer cod, String ubicacion) {
    }
}
