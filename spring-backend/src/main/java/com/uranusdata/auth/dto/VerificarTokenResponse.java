package com.uranusdata.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record VerificarTokenResponse(boolean success, String mensaje, UsuarioRecuperacion usuario) {

    public record UsuarioRecuperacion(
            String documento,
            String nombre,
            String apellido,
            @JsonProperty("cod_estado_usuario") Integer codEstadoUsuario) {
    }
}
