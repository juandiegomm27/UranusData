package com.uranusdata.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LoginResponse(boolean success, String mensaje, UsuarioLogin usuario, String token) {

    public record UsuarioLogin(
            String documento,
            String nombre,
            String apellido,
            String rol,
            @JsonProperty("cod_estado_usuario") Integer codEstadoUsuario) {
    }
}