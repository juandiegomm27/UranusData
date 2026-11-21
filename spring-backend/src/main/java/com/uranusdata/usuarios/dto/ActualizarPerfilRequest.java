package com.uranusdata.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ActualizarPerfilRequest(
        @Pattern(regexp = "\\d{10}", message = "El documento debe tener exactamente 10 dígitos")
        String documento,

        @Pattern(regexp = "[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+", message = "El nombre solo admite letras y espacios")
        @Size(max = 45, message = "El nombre no puede pasar de 45 caracteres")
        String nombre,

        @Pattern(regexp = "[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+", message = "El apellido solo admite letras y espacios")
        @Size(max = 45, message = "El apellido no puede pasar de 45 caracteres")
        String apellido,

        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 100, message = "El correo no puede pasar de 100 caracteres")
        String correo,

        @Pattern(regexp = "\\d{10,15}", message = "El teléfono debe tener entre 10 y 15 dígitos")
        String telefono,

        @Size(min = 6, max = 15, message = "La contraseña debe tener entre 6 y 15 caracteres")
        String password,

        String verificarPassword) {

    public ActualizarPerfilRequest {
        documento = recortadoONulo(documento);
        nombre = recortadoONulo(nombre);
        apellido = recortadoONulo(apellido);
        correo = recortadoONulo(correo);
        telefono = recortadoONulo(telefono);
        password = vacioONulo(password);
        verificarPassword = vacioONulo(verificarPassword);
    }

    private static String recortadoONulo(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }

    private static String vacioONulo(String valor) {
        return (valor == null || valor.isEmpty()) ? null : valor;
    }
}
