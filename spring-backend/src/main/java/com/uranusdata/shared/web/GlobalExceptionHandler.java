package com.uranusdata.shared.web;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> apiException(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(ApiResponse.error(ex.getMessage(), null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> accesoDenegado(AccessDeniedException ex) {
        return ResponseEntity.status(403).body(ApiResponse.error("No autorizado para esta acción", null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> inesperado(Exception ex) {
        log.error("Error no controlado", ex);
        return ResponseEntity.internalServerError().body(ApiResponse.error("Error interno del servidor", null));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Object objetivo = ex.getBindingResult().getTarget();
        Map<String, List<String>> errores = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> errores
                .computeIfAbsent(nombreJson(objetivo, e.getField()), k -> new ArrayList<>())
                .add(e.getDefaultMessage()));
        return ResponseEntity.status(422).body(ApiResponse.error("Validación fallida", errores));
    }

    private static String nombreJson(Object objetivo, String campo) {
        if (objetivo == null) {
            return campo;
        }
        try {
            JsonProperty anotacion = objetivo.getClass()
                    .getDeclaredField(campo)
                    .getAnnotation(JsonProperty.class);
            if (anotacion != null && !anotacion.value().isBlank()) {
                return anotacion.value();
            }
        } catch (NoSuchFieldException | SecurityException e) {}
        return campo;
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        return ResponseEntity.status(statusCode).headers(headers)
                .body(ApiResponse.error(mensajePara(statusCode.value()), null));
    }

    private static String mensajePara(int status) {
        return switch (status) {
            case 400 -> "Solicitud inválida";
            case 404 -> "Recurso no encontrado";
            case 405 -> "Método no permitido";
            case 415 -> "Tipo de contenido no soportado";
            default -> status >= 500 ? "Error interno del servidor" : "Error en la solicitud";
        };
    }
}