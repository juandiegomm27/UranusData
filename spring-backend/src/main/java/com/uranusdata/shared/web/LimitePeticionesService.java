package com.uranusdata.shared.web;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class LimitePeticionesService {

    private static final int MAXIMO_CLAVES = 500;

    private final Map<String, Deque<Instant>> ventanas = new HashMap<>();


    public synchronized void verificar(String accion, String ip, int maximoPorMinuto) {
        Instant ahora = Instant.now();
        Instant limite = ahora.minusSeconds(60);

        if (ventanas.size() > MAXIMO_CLAVES) {
            purgar(limite);
        }

        Deque<Instant> ventana = ventanas.computeIfAbsent(accion + "|" + ip, k -> new ArrayDeque<>());
        while (!ventana.isEmpty() && ventana.peekFirst().isBefore(limite)) {
            ventana.pollFirst();
        }

        if (ventana.size() >= maximoPorMinuto) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Demasiadas peticiones. Intenta de nuevo en un minuto");
        }

        ventana.addLast(ahora);
    }

    private void purgar(Instant limite) {
        ventanas.values().forEach(ventana -> {
            while (!ventana.isEmpty() && ventana.peekFirst().isBefore(limite)) {
                ventana.pollFirst();
            }
        });
        ventanas.entrySet().removeIf(entrada -> entrada.getValue().isEmpty());
    }
}
