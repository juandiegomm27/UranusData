package com.uranusdata.inventario.equipos.repository;

import com.uranusdata.inventario.equipos.domain.TipoElemento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Catálogo de solo lectura: alimenta los desplegables de la pantalla. */
public interface TipoElementoRepository extends JpaRepository<TipoElemento, Integer> {

    List<TipoElemento> findAllByOrderByTipoAsc();
}
