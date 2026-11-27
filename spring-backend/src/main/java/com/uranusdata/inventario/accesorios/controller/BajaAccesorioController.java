package com.uranusdata.inventario.accesorios.controller;

import com.uranusdata.inventario.accesorios.dto.BajaAccesorioRequest;
import com.uranusdata.inventario.accesorios.services.AccesorioService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Ruta de baja de accesorios conservada según el contrato actual de Angular.
 */
@RestController
@RequestMapping("/inventario")
public class BajaAccesorioController {
    private final AccesorioService accesorios;

    public BajaAccesorioController(AccesorioService accesorios) {
        this.accesorios = accesorios;
    }

    @PostMapping("/accesorios/{idStock}/dar-de-baja")
    @PreAuthorize("hasAnyRole('Tecnico','Gerente')")
    public Map<String, Object> darDeBaja(@PathVariable Integer idStock,
            @Valid @RequestBody BajaAccesorioRequest datos) {
        return accesorios.darDeBaja(idStock, datos);
    }
}
