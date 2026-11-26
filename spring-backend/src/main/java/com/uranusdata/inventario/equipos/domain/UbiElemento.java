package com.uranusdata.inventario.equipos.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Catálogo de ubicaciones: Almacén Central, Sala 1, Sala 2, Sala 3. */
@Entity
@Table(name = "ubi_elemento")
public class UbiElemento {

    @Id
    @Column(name = "cod_ubi_elemento")
    private Integer codUbiElemento;

    @Column(name = "ubicacion", nullable = false)
    private String ubicacion;

    protected UbiElemento() {
    }

    public Integer getCodUbiElemento() {
        return codUbiElemento;
    }

    public String getUbicacion() {
        return ubicacion;
    }
}
