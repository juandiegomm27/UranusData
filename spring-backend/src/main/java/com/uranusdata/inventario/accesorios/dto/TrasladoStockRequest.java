package com.uranusdata.inventario.accesorios.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Solicitud para mover unidades disponibles entre ubicaciones. */
public record TrasladoStockRequest(
        @NotNull @JsonProperty("id_stock_origen") Integer idStockOrigen,
        @NotNull @JsonProperty("cod_ubi_destino") Integer codUbiDestino,
        @NotNull @Positive Integer cantidad) {}
