package com.uranusdata.auth.service;

import com.uranusdata.shared.web.ApiException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {

    private record Estado(int intentos, Instant bloqueadoHasta, Instant expira) {
    }

    private final int maxIntentos;
    private final Duration bloqueo;
    private final int maxFallosIp;
    private final Map<String, Estado> porDocumento = new HashMap<>();
    private final Map<String, Deque<Instant>> fallosPorIp = new HashMap<>();

    public LoginAttemptService(@Value("${app.login.max-intentos}") int maxIntentos,
                               @Value("${app.login.bloqueo-minutos}") long bloqueoMinutos,
                               @Value("${app.login.max-fallos-ip-minuto}") int maxFallosIp) {
        this.maxIntentos = maxIntentos;
        this.bloqueo = Duration.ofMinutes(bloqueoMinutos);
        this.maxFallosIp = maxFallosIp;
    }

    public synchronized void verificarIp(String ip) {
        Deque<Instant> fallos = fallosPorIp.get(ip);
        if (fallos == null) {
            return;
        }
        Instant limite = Instant.now().minusSeconds(60);
        while (!fallos.isEmpty() && fallos.peekFirst().isBefore(limite)) {
            fallos.pollFirst();
        }
        if (fallos.isEmpty()) {
            fallosPorIp.remove(ip);
            return;
        }
        if (fallos.size() >= maxFallosIp) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Demasiados intentos desde tu red. Intenta de nuevo en un minuto");
        }
    }

    public synchronized void verificarBloqueo(String documento) {
        Estado estado = porDocumento.get(documento);
        if (estado == null) {
            return;
        }
        Instant ahora = Instant.now();
        if (estado.bloqueadoHasta() != null && ahora.isBefore(estado.bloqueadoHasta())) {
            long minutos = Math.max(1, (long) Math.ceil(
                    Duration.between(ahora, estado.bloqueadoHasta()).toSeconds() / 60.0));
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Demasiados intentos. Intenta de nuevo en " + minutos + " minuto(s)");
        }
        if (estado.bloqueadoHasta() != null || ahora.isAfter(estado.expira())) {
            porDocumento.remove(documento);
        }
    }

    public synchronized void registrarFallo(String documento, String ip) {
        Instant ahora = Instant.now();
        porDocumento.compute(documento, (k, actual) -> {
            int intentos = (actual == null || ahora.isAfter(actual.expira())) ? 1 : actual.intentos() + 1;
            Instant bloqueadoHasta = intentos >= maxIntentos ? ahora.plus(bloqueo) : null;
            return new Estado(intentos, bloqueadoHasta, ahora.plus(bloqueo));
        });
        fallosPorIp.computeIfAbsent(ip, k -> new ArrayDeque<>()).addLast(ahora);
    }

    public synchronized void limpiar(String documento) {
        porDocumento.remove(documento);
    }
}