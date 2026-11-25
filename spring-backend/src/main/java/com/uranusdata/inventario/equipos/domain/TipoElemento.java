package com.uranusdata.inventario.equipos.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Catálogo de tipos: Cómputo, Monitores, Proyectores, Periféricos, Impresoras. */
@Entity
@Table(name = "tipo_elemento")
public class TipoElemento {

    @Id
    @Column(name = "cod_tipo_elemento")
    private Integer codTipoElemento;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    protected TipoElemento() {
    }

    public Integer getCodTipoElemento() {
        return codTipoElemento;
    }

    public String getTipo() {
        return tipo;
    }
}
