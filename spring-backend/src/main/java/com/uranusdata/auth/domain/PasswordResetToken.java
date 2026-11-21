package com.uranusdata.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @Column(name = "documento")
    private String documento;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    protected PasswordResetToken() {
    }

    public PasswordResetToken(String documento, String tokenHash, Instant expiresAt) {
        this.documento = documento;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public String getDocumento() {
        return documento;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    /** Reemplaza el token vivo del usuario por uno nuevo. */
    public void renovar(String tokenHash, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public boolean estaExpirado(Instant ahora) {
        return ahora.isAfter(expiresAt);
    }
}
