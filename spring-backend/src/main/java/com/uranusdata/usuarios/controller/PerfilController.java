package com.uranusdata.usuarios.controller;

import com.uranusdata.shared.web.ApiResponse;
import com.uranusdata.usuarios.dto.ActualizarPerfilRequest;
import com.uranusdata.usuarios.dto.PerfilResponse;
import com.uranusdata.usuarios.service.PerfilService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/perfil")
public class PerfilController {

    private static final String AUTORIDAD_GERENTE = "ROLE_Gerente";

    private final PerfilService perfil;

    public PerfilController(PerfilService perfil) {
        this.perfil = perfil;
    }

    @GetMapping("/{documento}")
    public ApiResponse<PerfilResponse> obtener(@PathVariable String documento,
                                               Authentication autenticacion) {
        PerfilResponse datos = perfil.obtener(documento, autenticacion.getName(), esGerente(autenticacion));
        return ApiResponse.ok(datos, "Perfil obtenido correctamente");
    }

    @PutMapping("/{documento}")
    public ApiResponse<PerfilResponse> actualizar(@PathVariable String documento,
                                                  @Valid @RequestBody ActualizarPerfilRequest peticion,
                                                  Authentication autenticacion) {
        PerfilResponse datos = perfil.actualizar(documento, peticion,
                autenticacion.getName(), esGerente(autenticacion));
        return ApiResponse.ok(datos, "Perfil actualizado correctamente");
    }

    private static boolean esGerente(Authentication autenticacion) {
        return autenticacion.getAuthorities().stream()
                .anyMatch(autoridad -> AUTORIDAD_GERENTE.equals(autoridad.getAuthority()));
    }
}
