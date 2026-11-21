package com.uranusdata.usuarios.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rol")
public class Rol {

    @Id
    @Column(name = "cod_rol")
    private Integer codRol;

    @Column(name = "cargo", nullable = false)
    private String cargo;

    protected Rol() {
    }

    public Integer getCodRol() {
        return codRol;
    }

    public String getCargo() {
        return cargo;
    }
}