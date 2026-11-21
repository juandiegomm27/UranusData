package com.uranusdata.usuarios.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "telefono")
public class Telefono {

    @Id
    @Column(name = "telefono")
    private String telefono;

    @Column(name = "documento", nullable = false)
    private String documento;

    protected Telefono() {
    }

    public Telefono(String telefono, String documento) {
        this.telefono = telefono;
        this.documento = documento;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getDocumento() {
        return documento;
    }
}
