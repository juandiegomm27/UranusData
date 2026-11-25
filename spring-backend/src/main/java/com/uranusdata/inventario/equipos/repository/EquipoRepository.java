package com.uranusdata.inventario.equipos.repository;

import com.uranusdata.inventario.equipos.domain.Equipo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipoRepository extends JpaRepository<Equipo, Integer> {

    /**
     * Trae todos los equipos con sus catálogos y su padre ya cargados.
     *
     * El @EntityGraph es lo que evita el problema de las N+1 consultas: sin
     * él, pintar una tabla de 200 filas con marca, tipo, ubicación, estado y
     * padre lanzaría más de mil consultas sueltas. Con él, una sola.
     */
    @EntityGraph(attributePaths = {"tipo", "marca", "estado", "ubicacion", "padre"})
    List<Equipo> findAllByOrderByCodElementoAsc();

    @EntityGraph(attributePaths = {"tipo", "marca", "estado", "ubicacion", "padre"})
    Optional<Equipo> findByCodElementoIgnoreCase(String codElemento);

    /** Los componentes de un equipo. */
    @EntityGraph(attributePaths = {"tipo", "marca", "estado", "ubicacion"})
    List<Equipo> findByPadreIdElementoOrderByCodElementoAsc(Integer idPadre);

    boolean existsByCodElementoIgnoreCase(String codElemento);

    boolean existsBySerialIgnoreCase(String serial);
}
