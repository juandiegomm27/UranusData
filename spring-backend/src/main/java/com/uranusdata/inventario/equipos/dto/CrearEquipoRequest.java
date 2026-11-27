package com.uranusdata.inventario.equipos.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Lo que llega al registrar un equipo. Los campos marcados con asterisco en el
 * boceto son los que aquí llevan @NotBlank o @NotNull.
 *
 * El serial es opcional, de acuerdo con el formulario de inventario y con el
 * esquema de PostgreSQL.
 */
public record CrearEquipoRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede pasar de 100 caracteres")
        @JsonProperty("nombre_elemento")
        String nombreElemento,

        @Size(max = 45, message = "El código no puede pasar de 45 caracteres")
        @Pattern(regexp = "[A-Za-z0-9-]*",
                 message = "El código solo admite letras, números y guiones")
        @JsonProperty("cod_elemento")
        String codElemento,

        @Size(max = 100, message = "El serial no puede pasar de 100 caracteres")
        String serial,

        @Size(max = 100, message = "El modelo no puede pasar de 100 caracteres")
        String modelo,

        @Size(max = 255, message = "La descripción no puede pasar de 255 caracteres")
        String descripcion,

        @NotNull(message = "El tipo es obligatorio")
        @JsonProperty("cod_tipo_elemento")
        Integer codTipoElemento,

        @JsonProperty("cod_marca")
        Integer codMarca,

        @NotNull(message = "La ubicación es obligatoria")
        @JsonProperty("cod_ubi_elemento")
        Integer codUbiElemento,

        /** Opcional: si viene, el equipo nace como componente de ese otro. */
        @JsonProperty("id_elemento_padre")
        Integer idElementoPadre) {

    /**
     * Los campos de texto llegan recortados y los vacíos convertidos en nulo.
     * Así «   » no pasa como código válido ni se guarda una cadena vacía donde
     * la columna espera NULL.
     */
    public CrearEquipoRequest {
        nombreElemento = limpiar(nombreElemento);
        codElemento = limpiar(codElemento);
        serial = limpiar(serial);
        modelo = limpiar(modelo);
        descripcion = limpiar(descripcion);
    }

    private static String limpiar(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }
}
