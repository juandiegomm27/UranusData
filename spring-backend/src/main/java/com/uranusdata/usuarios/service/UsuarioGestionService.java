package com.uranusdata.usuarios.service;

import com.uranusdata.shared.web.ApiException;
import com.uranusdata.usuarios.domain.Correo;
import com.uranusdata.usuarios.domain.EstadoUsuario;
import com.uranusdata.usuarios.domain.Rol;
import com.uranusdata.usuarios.domain.Telefono;
import com.uranusdata.usuarios.domain.Usuario;
import com.uranusdata.usuarios.dto.ActualizarUsuarioRequest;
import com.uranusdata.usuarios.dto.CrearUsuarioRequest;
import com.uranusdata.usuarios.dto.UsuarioGestionResponse;
import com.uranusdata.usuarios.repository.CorreoRepository;
import com.uranusdata.usuarios.repository.EstadoUsuarioRepository;
import com.uranusdata.usuarios.repository.RolRepository;
import com.uranusdata.usuarios.repository.TelefonoRepository;
import com.uranusdata.usuarios.repository.UsuarioEspecificaciones;
import com.uranusdata.usuarios.repository.UsuarioRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioGestionService {

    public static final String PASSWORD_INICIAL = "1234567890";

    private static final int POR_PAGINA_POR_DEFECTO = 10;
    private static final int MAXIMO_POR_PAGINA = 100;

    private final UsuarioRepository usuarios;
    private final CorreoRepository correos;
    private final TelefonoRepository telefonos;
    private final RolRepository roles;
    private final EstadoUsuarioRepository estados;
    private final PasswordEncoder encoder;

    public UsuarioGestionService(
            UsuarioRepository usuarios,
            CorreoRepository correos,
            TelefonoRepository telefonos,
            RolRepository roles,
            EstadoUsuarioRepository estados,
            PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.correos = correos;
        this.telefonos = telefonos;
        this.roles = roles;
        this.estados = estados;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioGestionResponse> listar(
            String documento, 
            String busqueda, 
            Integer rol,
            Integer estado, 
            Integer pagina, 
            Integer porPagina) {
        int tamano = (porPagina == null || porPagina < 1)
                ? POR_PAGINA_POR_DEFECTO
                : Math.min(porPagina, MAXIMO_POR_PAGINA);
        int indice = (pagina == null || pagina < 1) ? 0 : pagina - 1;

        PageRequest peticion = PageRequest.of(indice, tamano, Sort.by("documento"));

        List<Specification<Usuario>> filtros = new ArrayList<>();
        String documentoFiltro = enBlancoEsNulo(documento);
        String busquedaFiltro = enBlancoEsNulo(busqueda);
        if (documentoFiltro != null) {
            filtros.add(UsuarioEspecificaciones.documentoContiene(documentoFiltro));
        }
        if (busquedaFiltro != null) {
            filtros.add(UsuarioEspecificaciones.busquedaLibre(busquedaFiltro));
        }
        if (rol != null) {
            filtros.add(UsuarioEspecificaciones.conRol(rol));
        }
        if (estado != null) {
            filtros.add(UsuarioEspecificaciones.conEstado(estado));
        }

        return usuarios.findAll(Specification.allOf(filtros), peticion).map(this::respuesta);
    }

    @Transactional(readOnly = true)
    public UsuarioGestionResponse obtener(String documento) {
        return respuesta(buscar(documento));
    }

    @Transactional
    public UsuarioGestionResponse crear(CrearUsuarioRequest peticion) {
        if (usuarios.existsById(peticion.documento())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "El documento ya está registrado");
        }
        if (correos.existsById(peticion.correo())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "El correo ya está registrado");
        }
        if (telefonos.existsById(peticion.telefono())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "El teléfono ya está registrado");
        }

        Rol rol = roles.findById(peticion.codRol())
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_CONTENT,
                        "El rol indicado no existe"));

        Usuario usuario = usuarios.save(new Usuario(
                peticion.documento(),
                peticion.nombre(),
                peticion.apellido(),
                rol,
                Usuario.ACTIVO,
                encoder.encode(PASSWORD_INICIAL)));

        correos.save(new Correo(peticion.correo(), usuario.getDocumento()));
        telefonos.save(new Telefono(peticion.telefono(), usuario.getDocumento()));

        return respuesta(usuario);
    }

    @Transactional
    public UsuarioGestionResponse actualizar(String documento, ActualizarUsuarioRequest peticion, String solicitante) {
        Usuario usuario = buscar(documento);

        if (peticion.codEstadoUsuario() != null) {
            boolean seDesactivaASiMismo = documento.equals(solicitante)
                    && peticion.codEstadoUsuario() != Usuario.ACTIVO;
            if (seDesactivaASiMismo) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "No puedes dejar tu propio usuario inactivo o bloqueado");
            }
            usuario.cambiarEstado(peticion.codEstadoUsuario());
        }

        return respuesta(usuario);
    }

    @Transactional
    public void eliminar(String documento, String solicitante) {
        Usuario usuario = buscar(documento);

        if (documento.equals(solicitante)) {
            throw new ApiException(HttpStatus.CONFLICT, "No puedes eliminar tu propio usuario");
        }

        try {
            usuarios.delete(usuario);
            usuarios.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "No se puede eliminar el usuario porque tiene reservas o mantenimientos asociados");
        }
    }

    @Transactional(readOnly = true)
    public List<UsuarioGestionResponse.EstadoResumen> listarEstados() {
        return estados.findAll().stream()
                .map(e -> new UsuarioGestionResponse.EstadoResumen(e.getCodEstadoUsuario(), e.getEstado()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioGestionResponse.RolResumen> listarRoles() {
        return roles.findAll().stream()
                .map(r -> new UsuarioGestionResponse.RolResumen(r.getCodRol(), r.getCargo()))
                .toList();
    }

    private Usuario buscar(String documento) {
        return usuarios.findById(documento)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private static String enBlancoEsNulo(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }

    private UsuarioGestionResponse respuesta(Usuario usuario) {
        String nombreEstado = estados.findById(usuario.getCodEstadoUsuario())
                .map(EstadoUsuario::getEstado)
                .orElse(null);

        List<UsuarioGestionResponse.CorreoResumen> listaCorreos = correos
                .findAllByDocumento(usuario.getDocumento()).stream()
                .map(c -> new UsuarioGestionResponse.CorreoResumen(c.getCorreo()))
                .toList();

        List<UsuarioGestionResponse.TelefonoResumen> listaTelefonos = telefonos
                .findAllByDocumento(usuario.getDocumento()).stream()
                .map(t -> new UsuarioGestionResponse.TelefonoResumen(t.getTelefono()))
                .toList();

        return new UsuarioGestionResponse(
                usuario.getDocumento(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getRol().getCodRol(),
                usuario.getCodEstadoUsuario(),
                new UsuarioGestionResponse.RolResumen(usuario.getRol().getCodRol(),
                        usuario.getRol().getCargo()),
                new UsuarioGestionResponse.EstadoResumen(usuario.getCodEstadoUsuario(), nombreEstado),
                listaCorreos,
                listaTelefonos);
    }
}
