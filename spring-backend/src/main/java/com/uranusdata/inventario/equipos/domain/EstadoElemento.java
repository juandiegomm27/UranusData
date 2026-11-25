package com.uranusdata.inventario.equipos.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Catálogo de estados: Activo, En préstamo, Mantenimiento, Baja. */
@Entity
@Table(name = "estado_elemento")
public class EstadoElemento {

    @Id
    @Column(name = "cod_estado_elemento")
    private Integer codEstadoElemento;

    @Column(name = "estado", nullable = false)
    private String estado;

    protected EstadoElemento() {
    }

    public Integer getCodEstadoElemento() {
        return codEstadoElemento;
    }

    public String getEstado() {
        return estado;
    }
}
