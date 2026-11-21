package com.uranusdata.auth.service;

import com.uranusdata.usuarios.domain.Usuario;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final Duration duracion;
    // jti -> expiración. En memoria: se pierde al reiniciar el servidor.
    private final Map<String, Instant> revocados = new ConcurrentHashMap<>();

    public JwtService(JwtEncoder encoder, @Value("${app.jwt.expiration-minutes}") long minutos) {
        this.encoder = encoder;
        this.duracion = Duration.ofMinutes(minutos);
    }

    public String generar(Usuario usuario) {
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .id(UUID.randomUUID().toString())
                .subject(usuario.getDocumento())
                .claim("rol", usuario.getRol().getCargo())
                .issuedAt(ahora)
                .expiresAt(ahora.plus(duracion))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public void revocar(Jwt jwt) {
        Instant ahora = Instant.now();
        revocados.values().removeIf(expira -> expira.isBefore(ahora));
        revocados.put(jwt.getId(), jwt.getExpiresAt());
    }

    public boolean estaRevocado(Jwt jwt) {
        return jwt.getId() != null && revocados.containsKey(jwt.getId());
    }
}