package com.uranusdata.usuarios.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CrearUsuarioRequest(
        @NotBlank(message = "El documento es obligatorio")
        @Pattern(regexp = "\\d{10}", message = "El documento debe tener exactamente 10 dígitos")
        String documento,

        @NotBlank(message = "El nombre es obligatorio")
        @Pattern(regexp = "[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+", message = "El nombre solo admite letras y espacios")
        @Size(max = 45, message = "El nombre no puede pasar de 45 caracteres")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        @Pattern(regexp = "[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+", message = "El apellido solo admite letras y espacios")
        @Size(max = 45, message = "El apellido no puede pasar de 45 caracteres")
        String apellido,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 100, message = "El correo no puede pasar de 100 caracteres")
        String correo,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = "\\d{7,15}", message = "El teléfono debe tener entre 7 y 15 dígitos")
        String telefono,

        @NotNull(message = "El rol es obligatorio")
        @JsonProperty("cod_rol")
        Integer codRol) {
}
