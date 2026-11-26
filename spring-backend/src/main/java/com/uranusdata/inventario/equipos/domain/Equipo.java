package com.uranusdata.inventario.equipos.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Un equipo del inventario: elemento con serial, identificable uno a uno.
 * Se mapea sobre la tabla «inventario».
 *
 * Un equipo puede ser componente de otro a través de id_elemento_padre. La
 * jerarquía es de un solo nivel: un componente no tiene componentes propios,
 * y eso lo hace cumplir el servicio, porque la base por sí sola no lo impide.
 */
@Entity
@Table(name = "inventario")
public class Equipo {

    /** Estados del catálogo estado_elemento, cargados por la migración V3. */
    public static final int ACTIVO = 1;
    public static final int EN_PRESTAMO = 2;
    public static final int MANTENIMIENTO = 3;
    public static final int BAJA = 4;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_elemento")
    private Integer idElemento;

    @Column(name = "cod_elemento", unique = true)
    private String codElemento;

    @Column(name = "nombre_elemento", nullable = false)
    private String nombreElemento;

    @Column(name = "serial", unique = true)
    private String serial;

    @Column(name = "modelo")
    private String modelo;

    @Column(name = "descripcion")
    private String descripcion;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cod_tipo_elemento")
    private TipoElemento tipo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cod_marca")
    private Marca marca;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cod_estado_elemento")
    private EstadoElemento estado;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cod_ubi_elemento")
    private UbiElemento ubicacion;

    /**
     * El equipo del que este es componente. NULL significa que es principal.
     * Se carga perezoso: en el listado solo hace falta saber si existe, y para
     * eso basta con el id de la columna.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_elemento_padre")
    private Equipo padre;

    protected Equipo() {
    }

    public Equipo(String codElemento, String nombreElemento, String serial, String modelo,
                  String descripcion, TipoElemento tipo, Marca marca,
                  EstadoElemento estado, UbiElemento ubicacion) {
        this.codElemento = codElemento;
        this.nombreElemento = nombreElemento;
        this.serial = serial;
        this.modelo = modelo;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.marca = marca;
        this.estado = estado;
        this.ubicacion = ubicacion;
    }

    public Integer getIdElemento() {
        return idElemento;
    }

    public String getCodElemento() {
        return codElemento;
    }

    public String getNombreElemento() {
        return nombreElemento;
    }

    public String getSerial() {
        return serial;
    }

    public String getModelo() {
        return modelo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public TipoElemento getTipo() {
        return tipo;
    }

    public Marca getMarca() {
        return marca;
    }

    public EstadoElemento getEstado() {
        return estado;
    }

    public UbiElemento getUbicacion() {
        return ubicacion;
    }

    public Equipo getPadre() {
        return padre;
    }

    public boolean esComponente() {
        return padre != null;
    }

    public boolean estaActivo() {
        return ACTIVO == estado.getCodEstadoElemento();
    }

    /** Vincula este equipo como componente de otro. */
    public void vincularA(Equipo principal) {
        this.padre = principal;
    }

    /** Lo deja como equipo independiente. */
    public void desvincular() {
        this.padre = null;
    }

    public void cambiarEstado(EstadoElemento estado) {
        this.estado = estado;
    }

    public void cambiarUbicacion(UbiElemento ubicacion) {
        this.ubicacion = ubicacion;
    }

    public void cambiarDatos(String codElemento, String nombreElemento, String serial,
                             String modelo, String descripcion) {
        this.codElemento = codElemento;
        this.nombreElemento = nombreElemento;
        this.serial = serial;
        this.modelo = modelo;
        this.descripcion = descripcion;
    }
}
