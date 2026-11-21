package com.uranusdata.shared.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String mensaje,
        T data,
        Map<String, List<String>> errors,
        String timestamp) {

    public static <T> ApiResponse<T> ok(T data, String mensaje) {
        return new ApiResponse<>(true, mensaje, data, null, ahora());
    }

    public static ApiResponse<Void> error(String mensaje, Map<String, List<String>> errors) {
        return new ApiResponse<>(false, mensaje, null, errors, ahora());
    }

    private static String ahora() {
        return Instant.now().truncatedTo(ChronoUnit.SECONDS).toString();
    }
}