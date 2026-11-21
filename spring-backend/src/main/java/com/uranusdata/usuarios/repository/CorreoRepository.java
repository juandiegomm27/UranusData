package com.uranusdata.usuarios.repository;

import com.uranusdata.usuarios.domain.Correo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorreoRepository extends JpaRepository<Correo, String> {

    Optional<Correo> findByDocumentoAndCorreoIgnoreCase(String documento, String correo);

    Optional<Correo> findFirstByDocumento(String documento);

    List<Correo> findAllByDocumento(String documento);
}
