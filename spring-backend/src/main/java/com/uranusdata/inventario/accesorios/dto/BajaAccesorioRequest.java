package com.uranusdata.inventario.accesorios.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Cantidad y motivo para retirar unidades de una ubicación. */
public record BajaAccesorioRequest(@NotNull @Min(1) Integer cantidad,
                                   @Size(max = 255) String motivo) {}
