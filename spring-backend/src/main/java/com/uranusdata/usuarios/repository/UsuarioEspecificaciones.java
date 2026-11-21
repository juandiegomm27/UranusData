package com.uranusdata.usuarios.repository;

import com.uranusdata.usuarios.domain.Usuario;
import org.springframework.data.jpa.domain.Specification;

public final class UsuarioEspecificaciones {

    private UsuarioEspecificaciones() {
    }

    public static Specification<Usuario> documentoContiene(String texto) {
        String patron = patron(texto);
        return (raiz, consulta, cb) -> cb.like(cb.lower(raiz.get("documento")), patron);
    }

    public static Specification<Usuario> busquedaLibre(String texto) {
        String patron = patron(texto);
        return (raiz, consulta, cb) -> cb.or(
                cb.like(cb.lower(raiz.get("documento")), patron),
                cb.like(cb.lower(raiz.get("nombre")), patron),
                cb.like(cb.lower(raiz.get("apellido")), patron));
    }

    public static Specification<Usuario> conRol(Integer codRol) {
        return (raiz, consulta, cb) -> cb.equal(raiz.get("rol").get("codRol"), codRol);
    }

    public static Specification<Usuario> conEstado(Integer codEstadoUsuario) {
        return (raiz, consulta, cb) -> cb.equal(raiz.get("codEstadoUsuario"), codEstadoUsuario);
    }

    private static String patron(String texto) {
        return "%" + texto.toLowerCase() + "%";
    }
}
