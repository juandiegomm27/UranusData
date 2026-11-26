package com.uranusdata.inventario.equipos.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import org.springframework.data.domain.Page;

/**
 * La página de resultados tal como la lee el frontend:
 *
 *     response.data · response.total · response.last_page
 *
 * Es plana a propósito. El módulo de usuarios usa PaginatedResponse, que
 * anida esos datos bajo «pagination», pero la pantalla de inventario los
 * busca en la raíz porque así se los devolvía Laravel. Cambiar la forma aquí
 * obligaría a tocar el componente de Angular, y el acuerdo es que el frontend
 * no se entere del cambio de backend.
 */
public record PaginaInventario(
        List<EquipoResponse> data,
        long total,
        @JsonProperty("current_page") int currentPage,
        @JsonProperty("per_page") int perPage,
        @JsonProperty("last_page") int lastPage,
        Integer from,
        Integer to) {

    public static PaginaInventario de(Page<EquipoResponse> pagina) {
        int enEstaPagina = pagina.getNumberOfElements();
        int desplazamiento = (int) pagina.getPageable().getOffset();

        return new PaginaInventario(
                pagina.getContent(),
                pagina.getTotalElements(),
                pagina.getNumber() + 1,
                pagina.getSize(),
                // Con cero resultados, Laravel devuelve 1, no 0: así la
                // paginación del frontend no se queda sin páginas.
                Math.max(pagina.getTotalPages(), 1),
                enEstaPagina == 0 ? null : desplazamiento + 1,
                enEstaPagina == 0 ? null : desplazamiento + enEstaPagina);
    }
}
