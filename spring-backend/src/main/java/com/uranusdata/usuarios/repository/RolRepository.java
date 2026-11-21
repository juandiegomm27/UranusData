package com.uranusdata.usuarios.repository;

import com.uranusdata.usuarios.domain.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Integer> {
}
