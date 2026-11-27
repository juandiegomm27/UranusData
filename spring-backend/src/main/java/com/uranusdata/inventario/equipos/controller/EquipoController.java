package com.uranusdata.inventario.equipos.controller;

import com.uranusdata.inventario.equipos.dto.EquipoResponse;
import com.uranusdata.inventario.equipos.dto.FiltroEquipos;
import com.uranusdata.inventario.equipos.dto.OpcionesResponse;
import com.uranusdata.inventario.equipos.dto.PaginaInventario;
import com.uranusdata.inventario.equipos.dto.CrearEquipoRequest;
import com.uranusdata.inventario.equipos.service.EquipoService;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.Authentication;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Equipos del inventario.
 *
 * La ruta y los nombres de los parámetros no son una elección: son los que ya
 * usa inventario.service.ts de Angular. El frontend no se entera de que
 * detrás cambió Laravel por Spring, que es justamente el acuerdo.
 *
 * Consultar lo puede hacer cualquiera que haya entrado, incluido el Docente,
 * que tiene acceso de solo lectura. Lo que escribe llevará su propio
 * @PreAuthorize de Técnico o Gerente.
 */
@RestController
@RequestMapping("/inventario")
public class EquipoController {

    private final EquipoService equipos;

    public EquipoController(EquipoService equipos) {
        this.equipos = equipos;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Tecnico','Gerente')")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public EquipoResponse crear(@Valid @RequestBody CrearEquipoRequest datos, Authentication auth) {
        return equipos.crear(datos, auth.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Tecnico','Gerente')")
    public EquipoResponse actualizar(@PathVariable Integer id, @Valid @RequestBody CrearEquipoRequest datos, Authentication auth) {
        return equipos.actualizar(id, datos, auth.getName());
    }

    @PatchMapping("/activos/{id}/dar-de-baja")
    @PreAuthorize("hasAnyRole('Tecnico','Gerente')")
    public java.util.Map<String, Object> darDeBaja(@PathVariable Integer id, @Valid @RequestBody(required = false) MotivoRequest body, Authentication auth) {
        equipos.darDeBaja(id, body == null ? null : body.motivo(), auth.getName());
        return java.util.Map.of("success", true, "mensaje", "Activo fijo dado de baja correctamente.");
    }

    public record MotivoRequest(@Size(max=255) String motivo) {}

    public record MantenimientoRequest(@NotNull @com.fasterxml.jackson.annotation.JsonProperty("cod_tipo_mantenimiento") Integer codTipoMantenimiento,
                                       @NotNull @Size(max=2000) String descripcion) {}

    @PostMapping("/{id}/mantenimiento")
    @PreAuthorize("hasAnyRole('Tecnico','Gerente')")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public java.util.Map<String,Object> mantenimiento(@PathVariable Integer id, @Valid @RequestBody MantenimientoRequest body, Authentication auth) {
        return java.util.Map.of("success",true,"mensaje","Elemento enviado a mantenimiento exitosamente",
                "data",equipos.enviarMantenimiento(id,body.codTipoMantenimiento(),body.descripcion(),auth.getName()));
    }

    @GetMapping("/{id}/historial")
    public List<java.util.Map<String,Object>> historial(@PathVariable Integer id) { return equipos.historialMantenimiento(id); }

    @GetMapping("/{id}/movimientos")
    public java.util.Map<String,Object> movimientos(@PathVariable Integer id,
            @RequestParam(required=false) Integer page, @RequestParam(name="per_page",required=false) Integer perPage) {
        return equipos.movimientos(id,page,perPage);
    }

    /**
     * Listado con búsqueda, filtros y paginación.
     *
     * Los nombres vienen del frontend: «search» en vez de busqueda, y
     * «principales=1» en vez de una pestaña con tres valores.
     */
    @GetMapping
    public PaginaInventario listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer tipo,
            @RequestParam(required = false) Integer marca,
            @RequestParam(required = false) Integer ubicacion,
            @RequestParam(required = false) Integer estado,
            @RequestParam(required = false) String principales,
            @RequestParam(required = false) Integer page,
            @RequestParam(name = "per_page", required = false) Integer perPage) {

        FiltroEquipos.Relacion relacion = "1".equals(principales)
                ? FiltroEquipos.Relacion.PRINCIPALES
                : FiltroEquipos.Relacion.TODOS;

        FiltroEquipos filtro = new FiltroEquipos(search, tipo, marca, ubicacion, estado, relacion);

        Page<EquipoResponse> pagina = equipos.listar(filtro, page, perPage);
        return PaginaInventario.de(pagina);
    }

    /** Los catálogos de los desplegables. */
    @GetMapping("/opciones")
    public OpcionesResponse opciones() {
        return equipos.opciones();
    }

    /** Detalle de un equipo con sus componentes. */
    @GetMapping("/{id}")
    public EquipoResponse detalle(@PathVariable Integer id) {
        return equipos.detallePorId(id);
    }

    /** Los que se pueden vincular como componentes de este. */
    @GetMapping("/{id}/candidatos")
    @PreAuthorize("hasAnyRole('Tecnico','Gerente')")
    public List<EquipoResponse> candidatos(@PathVariable Integer id) {
        return equipos.candidatosAComponente(id);
    }
}
