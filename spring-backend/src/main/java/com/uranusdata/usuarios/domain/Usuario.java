package com.uranusdata.usuarios.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuario")
public class Usuario {

    public static final int ACTIVO = 1;
    public static final int INACTIVO = 2;
    public static final int BLOQUEADO = 3;

    @Id
    @Column(name = "documento")
    private String documento;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "apellido", nullable = false)
    private String apellido;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "cod_rol")
    private Rol rol;

    @Column(name = "cod_estado_usuario", nullable = false)
    private Integer codEstadoUsuario;

    @Column(name = "password", nullable = false)
    private String password;

    protected Usuario() {
    }

    public Usuario(String documento, String nombre, String apellido, Rol rol,
                   Integer codEstadoUsuario, String password) {
        this.documento = documento;
        this.nombre = nombre;
        this.apellido = apellido;
        this.rol = rol;
        this.codEstadoUsuario = codEstadoUsuario;
        this.password = password;
    }

    public String getDocumento() {
        return documento;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public Rol getRol() {
        return rol;
    }

    public Integer getCodEstadoUsuario() {
        return codEstadoUsuario;
    }

    public String getPassword() {
        return password;
    }

    public void cambiarPassword(String passwordCodificada) {
        this.password = passwordCodificada;
    }

    public void cambiarNombre(String nombre) {
        this.nombre = nombre;
    }

    public void cambiarApellido(String apellido) {
        this.apellido = apellido;
    }

    public void cambiarEstado(Integer codEstadoUsuario) {
        this.codEstadoUsuario = codEstadoUsuario;
    }
}