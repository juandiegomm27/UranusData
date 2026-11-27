package com.uranusdata.inventario.accesorios.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos que Angular envía al crear, aumentar existencias o editar un accesorio. */
public record AccesorioRequest(
        @JsonProperty("id_accesorio") Integer idAccesorio,
        @NotBlank @Size(max = 100) String nombre,
        @Size(max = 100) String modelo,
        String descripcion,
        @JsonProperty("cod_tipo_elemento") Integer codTipoElemento,
        @JsonProperty("cod_marca") Integer codMarca,
        @JsonProperty("cantidad_total") Integer cantidadTotal,
        @JsonProperty("cod_ubi_elemento") Integer codUbiElemento) {}
