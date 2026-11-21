package com.uranusdata.usuarios.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PerfilResponse(
        String documento,
        String nombre,
        String apellido,
        @JsonProperty("cod_estado_usuario") Integer codEstadoUsuario,
        RolPerfil rol,
        List<CorreoPerfil> correos,
        List<TelefonoPerfil> telefonos) {

    public record RolPerfil(@JsonProperty("cod_rol") Integer codRol, String cargo) {
    }

    public record CorreoPerfil(String correo) {
    }

    public record TelefonoPerfil(String telefono) {
    }
}
