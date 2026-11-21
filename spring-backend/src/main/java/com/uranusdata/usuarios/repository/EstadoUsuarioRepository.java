package com.uranusdata.usuarios.repository;

import com.uranusdata.usuarios.domain.EstadoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoUsuarioRepository extends JpaRepository<EstadoUsuario, Integer> {
}
