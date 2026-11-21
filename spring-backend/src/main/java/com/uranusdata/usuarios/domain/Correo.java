package com.uranusdata.usuarios.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "correo")
public class Correo {

    @Id
    @Column(name = "correo")
    private String correo;

    @Column(name = "documento", nullable = false)
    private String documento;

    protected Correo() {
    }

    public Correo(String correo, String documento) {
        this.correo = correo;
        this.documento = documento;
    }

    public String getCorreo() {
        return correo;
    }

    public String getDocumento() {
        return documento;
    }
}
