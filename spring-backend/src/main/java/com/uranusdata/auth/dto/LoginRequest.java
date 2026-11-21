package com.uranusdata.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "El documento es obligatorio")
        @Pattern(regexp = "\\d{10}", message = "El documento debe tener exactamente 10 dígitos")
        String documento,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 15, message = "La contraseña debe tener entre 6 y 15 caracteres")
        String password) {
}