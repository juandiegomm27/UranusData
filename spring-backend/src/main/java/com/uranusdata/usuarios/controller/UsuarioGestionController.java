package com.uranusdata.usuarios.controller;

import com.uranusdata.shared.web.ApiResponse;
import com.uranusdata.shared.web.PaginatedResponse;
import com.uranusdata.usuarios.dto.ActualizarUsuarioRequest;
import com.uranusdata.usuarios.dto.CrearUsuarioRequest;
import com.uranusdata.usuarios.dto.UsuarioGestionResponse;
import com.uranusdata.usuarios.service.UsuarioGestionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gestion/usuario")
@PreAuthorize("hasRole('Gerente')")
public class UsuarioGestionController {

    private final UsuarioGestionService gestion;

    public UsuarioGestionController(UsuarioGestionService gestion) {
        this.gestion = gestion;
    }

    @GetMapping
    public PaginatedResponse<UsuarioGestionResponse> listar(
            @RequestParam(required = false) String documento,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) Integer rol,
            @RequestParam(required = false) Integer estado,
            @RequestParam(required = false) Integer page,
            @RequestParam(name = "per_page", required = false) Integer perPage) {

        Page<UsuarioGestionResponse> pagina = gestion.listar(documento, busqueda, rol, estado, page, perPage);
        return PaginatedResponse.de(pagina, "usuario obtenidos correctamente");
    }

    @GetMapping("/estados/list")
    public ApiResponse<List<UsuarioGestionResponse.EstadoResumen>> estados() {
        return ApiResponse.ok(gestion.listarEstados(), "Estados obtenidos correctamente");
    }

    @GetMapping("/rol/list")
    public ApiResponse<List<UsuarioGestionResponse.RolResumen>> roles() {
        return ApiResponse.ok(gestion.listarRoles(), "rol obtenidos correctamente");
    }

    @GetMapping("/{documento}")
    public ApiResponse<UsuarioGestionResponse> obtener(@PathVariable String documento) {
        return ApiResponse.ok(gestion.obtener(documento), "Usuario obtenido correctamente");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UsuarioGestionResponse> crear(@Valid @RequestBody CrearUsuarioRequest peticion) {
        return ApiResponse.ok(gestion.crear(peticion), "Usuario creado correctamente");
    }

    @PutMapping("/{documento}")
    public ApiResponse<UsuarioGestionResponse> actualizar(
            @PathVariable String documento,
            @Valid @RequestBody ActualizarUsuarioRequest peticion,
            Authentication autenticacion) {
        return ApiResponse.ok(gestion.actualizar(documento, peticion, autenticacion.getName()),
                "Usuario actualizado correctamente");
    }

    @DeleteMapping("/{documento}")
    public ApiResponse<Void> eliminar(@PathVariable String documento, Authentication autenticacion) {
        gestion.eliminar(documento, autenticacion.getName());
        return ApiResponse.ok(null, "Usuario eliminado correctamente");
    }
}
