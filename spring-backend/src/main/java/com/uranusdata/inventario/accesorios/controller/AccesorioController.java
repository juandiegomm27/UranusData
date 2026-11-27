package com.uranusdata.inventario.accesorios.controller;

import com.uranusdata.inventario.accesorios.dto.AccesorioPageResponse;
import com.uranusdata.inventario.accesorios.dto.AccesorioRequest;
import com.uranusdata.inventario.accesorios.dto.TrasladoStockRequest;
import com.uranusdata.inventario.accesorios.services.AccesorioService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints REST para catálogo de accesorios y stock por ubicación. */
@RestController
@RequestMapping("/inventario-accesorios")
public class AccesorioController {
    private final AccesorioService accesorios;

    public AccesorioController(AccesorioService accesorios) {
        this.accesorios = accesorios;
    }

    @GetMapping
    public AccesorioPageResponse listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer tipo,
            @RequestParam(required = false) Integer marca,
            @RequestParam(required = false) Integer ubicacion,
            @RequestParam(required = false) Integer page,
            @RequestParam(name = "per_page", required = false) Integer perPage) {
        return accesorios.listar(search, tipo, marca, ubicacion, page, perPage);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('Tecnico','Gerente')")
    public Map<String, Object> guardar(@Valid @RequestBody AccesorioRequest datos) {
        return accesorios.guardar(datos);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Tecnico','Gerente')")
    public Map<String, Object> actualizar(@PathVariable Integer id, @Valid @RequestBody AccesorioRequest datos) {
        return accesorios.actualizar(id, datos);
    }

    @PostMapping("/trasladar")
    @PreAuthorize("hasAnyRole('Tecnico','Gerente')")
    public Map<String, Object> trasladar(@Valid @RequestBody TrasladoStockRequest datos) {
        return accesorios.trasladar(datos);
    }
}
