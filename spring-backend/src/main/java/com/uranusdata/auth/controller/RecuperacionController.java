package com.uranusdata.auth.controller;

import com.uranusdata.auth.dto.ConfirmarRecuperacionRequest;
import com.uranusdata.auth.dto.SolicitarRecuperacionRequest;
import com.uranusdata.auth.dto.VerificarTokenResponse;
import com.uranusdata.auth.service.RecuperacionService;
import com.uranusdata.shared.web.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recuperar-contrasena")
public class RecuperacionController {

    private final RecuperacionService recuperacion;

    public RecuperacionController(RecuperacionService recuperacion) {
        this.recuperacion = recuperacion;
    }

    @PostMapping("/solicitar")
    public ApiResponse<Void> solicitar(@Valid @RequestBody SolicitarRecuperacionRequest peticion,
                                       HttpServletRequest http) {
        recuperacion.solicitar(peticion, http.getRemoteAddr());
        return ApiResponse.ok(null,
                "Se ha enviado un enlace de recuperación a tu correo. Revisa tu bandeja de entrada.");
    }

    @GetMapping("/verificar/{token}")
    public VerificarTokenResponse verificar(@PathVariable String token, HttpServletRequest http) {
        return recuperacion.verificar(token, http.getRemoteAddr());
    }

    @PostMapping("/confirmar")
    public ApiResponse<Void> confirmar(@Valid @RequestBody ConfirmarRecuperacionRequest peticion,
                                        HttpServletRequest http) {
        recuperacion.confirmar(peticion, http.getRemoteAddr());
        return ApiResponse.ok(null, "Contraseña actualizada. Ya puedes iniciar sesión.");
    }
}
