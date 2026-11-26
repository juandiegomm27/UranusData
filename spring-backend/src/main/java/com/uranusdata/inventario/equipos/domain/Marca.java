package com.uranusdata.inventario.equipos.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Catálogo de marcas. Es opcional en un equipo: puede no tenerla. */
@Entity
@Table(name = "marca")
public class Marca {

    @Id
    @Column(name = "cod_marca")
    private Integer codMarca;

    @Column(name = "marca", nullable = false)
    private String marca;

    protected Marca() {
    }

    public Integer getCodMarca() {
        return codMarca;
    }

    public String getMarca() {
        return marca;
    }
}
