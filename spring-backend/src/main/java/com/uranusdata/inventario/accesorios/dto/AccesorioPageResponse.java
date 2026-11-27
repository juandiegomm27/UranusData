package com.uranusdata.inventario.accesorios.dto;

import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonProperty;

/** Formato paginado que ya consume la pantalla Angular de inventario. */
public record AccesorioPageResponse(boolean success, List<Map<String, Object>> data,
                                   long total, @JsonProperty("last_page") int lastPage) {}
