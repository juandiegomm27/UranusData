package com.uranusdata.usuarios.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record ActualizarUsuarioRequest(
        @Min(value = 1, message = "El estado debe ser 1 (Activo), 2 (Inactivo) o 3 (Bloqueado)")
        @Max(value = 3, message = "El estado debe ser 1 (Activo), 2 (Inactivo) o 3 (Bloqueado)")
        @JsonProperty("cod_estado_usuario")
        Integer codEstadoUsuario) {
}
