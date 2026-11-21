package com.uranusdata.usuarios.repository;

import com.uranusdata.usuarios.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, String>,
        JpaSpecificationExecutor<Usuario> {

    @Modifying
    @Query(value = "UPDATE usuario SET documento = :nuevo WHERE documento = :actual",
            nativeQuery = true)
    int cambiarDocumento(@Param("actual") String actual, @Param("nuevo") String nuevo);
}
