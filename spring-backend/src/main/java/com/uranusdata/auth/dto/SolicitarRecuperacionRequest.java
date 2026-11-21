package com.uranusdata.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SolicitarRecuperacionRequest(
        @NotBlank(message = "El documento es obligatorio")
        @Pattern(regexp = "\\d{10}", message = "El documento debe tener exactamente 10 dígitos")
        String documento,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 100, message = "El correo no puede pasar de 100 caracteres")
        String correo) {
}
