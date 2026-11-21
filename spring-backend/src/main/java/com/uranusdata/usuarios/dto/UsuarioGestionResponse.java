package com.uranusdata.usuarios.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record UsuarioGestionResponse(
        String documento,
        String nombre,
        String apellido,
        @JsonProperty("cod_rol") Integer codRol,
        @JsonProperty("cod_estado_usuario") Integer codEstadoUsuario,
        RolResumen rol,
        EstadoResumen estado,
        List<CorreoResumen> correos,
        List<TelefonoResumen> telefonos) {

    public record RolResumen(@JsonProperty("cod_rol") Integer codRol, String cargo) {
    }

    public record EstadoResumen(@JsonProperty("cod_estado_usuario") Integer codEstadoUsuario, String estado) {
    }

    public record CorreoResumen(String correo) {
    }

    public record TelefonoResumen(String telefono) {
    }
}
