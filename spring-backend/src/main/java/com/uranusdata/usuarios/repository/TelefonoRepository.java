package com.uranusdata.usuarios.repository;

import com.uranusdata.usuarios.domain.Telefono;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TelefonoRepository extends JpaRepository<Telefono, String> {

    Optional<Telefono> findFirstByDocumento(String documento);

    List<Telefono> findAllByDocumento(String documento);
}
