package com.uranusdata.inventario.equipos.controller;

import com.uranusdata.inventario.equipos.dto.EquipoResponse;
import com.uranusdata.inventario.equipos.dto.FiltroEquipos;
import com.uranusdata.inventario.equipos.dto.OpcionesResponse;
import com.uranusdata.inventario.equipos.dto.PaginaInventario;
import com.uranusdata.inventario.equipos.service.EquipoService;
import java.util.List;
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
