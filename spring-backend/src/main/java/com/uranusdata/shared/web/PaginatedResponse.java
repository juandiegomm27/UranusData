package com.uranusdata.shared.web;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.data.domain.Page;

public record PaginatedResponse<T>(
        boolean success,
        String mensaje,
        List<T> data,
        Paginacion pagination,
        String timestamp) {

    public record Paginacion(
            long total,
            @JsonProperty("per_page") int perPage,
            @JsonProperty("current_page") int currentPage,
            @JsonProperty("last_page") int lastPage,
            Integer from,
            Integer to) {
    }

    public static <T> PaginatedResponse<T> de(Page<T> pagina, String mensaje) {
        int numeroPagina = pagina.getNumber() + 1;
        int enEstaPagina = pagina.getNumberOfElements();

        Integer desde = enEstaPagina == 0 ? null : (int) pagina.getPageable().getOffset() + 1;
        Integer hasta = enEstaPagina == 0 ? null : (int) pagina.getPageable().getOffset() + enEstaPagina;

        return new PaginatedResponse<>(
                true,
                mensaje,
                pagina.getContent(),
                new Paginacion(
                        pagina.getTotalElements(),
                        pagina.getSize(),
                        numeroPagina,
                        Math.max(pagina.getTotalPages(), 1),
                        desde,
                        hasta),
                Instant.now().truncatedTo(ChronoUnit.SECONDS).toString());
    }
}
