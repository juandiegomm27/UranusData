package com.uranusdata.usuarios.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "estado_usuario")
public class EstadoUsuario {

    @Id
    @Column(name = "cod_estado_usuario")
    private Integer codEstadoUsuario;

    @Column(name = "estado", nullable = false)
    private String estado;

    protected EstadoUsuario() {
    }

    public Integer getCodEstadoUsuario() {
        return codEstadoUsuario;
    }

    public String getEstado() {
        return estado;
    }
}
