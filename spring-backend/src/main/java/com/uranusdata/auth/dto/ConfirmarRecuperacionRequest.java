package com.uranusdata.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmarRecuperacionRequest(
        @NotBlank(message = "El token es obligatorio")
        String token,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 15, message = "La contraseña debe tener entre 6 y 15 caracteres")
        String password,

        @NotBlank(message = "La confirmación de la contraseña es obligatoria")
        String confirmPassword) {
}
