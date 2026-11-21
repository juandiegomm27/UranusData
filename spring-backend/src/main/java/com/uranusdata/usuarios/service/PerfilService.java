package com.uranusdata.usuarios.service;

import com.uranusdata.shared.mail.CorreoException;
import com.uranusdata.shared.mail.CorreoService;
import com.uranusdata.shared.web.ApiException;
import com.uranusdata.usuarios.domain.Correo;
import com.uranusdata.usuarios.domain.Telefono;
import com.uranusdata.usuarios.domain.Usuario;
import com.uranusdata.usuarios.dto.ActualizarPerfilRequest;
import com.uranusdata.usuarios.dto.PerfilResponse;
import com.uranusdata.usuarios.repository.CorreoRepository;
import com.uranusdata.usuarios.repository.TelefonoRepository;
import com.uranusdata.usuarios.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PerfilService {

    private static final Logger log = LoggerFactory.getLogger(PerfilService.class);

    private static final String ASUNTO = "Tu Perfil ha sido Actualizado - UranusData";
    private static final String PLANTILLA = "correo/perfil-actualizado";

    private final UsuarioRepository usuarios;
    private final CorreoRepository correos;
    private final TelefonoRepository telefonos;
    private final PasswordEncoder encoder;
    private final CorreoService correoService;
    private final EntityManager em;

    public PerfilService(UsuarioRepository usuarios, CorreoRepository correos,
                         TelefonoRepository telefonos, PasswordEncoder encoder,
                         CorreoService correoService, EntityManager em) {
        this.usuarios = usuarios;
        this.correos = correos;
        this.telefonos = telefonos;
        this.encoder = encoder;
        this.correoService = correoService;
        this.em = em;
    }

    @Transactional(readOnly = true)
    public PerfilResponse obtener(String documento, String solicitante, boolean esGerente) {
        verificarPermiso(documento, solicitante, esGerente, "No puedes ver el perfil de otro usuario");
        return respuesta(buscar(documento));
    }

    @Transactional
    public PerfilResponse actualizar(String documento, ActualizarPerfilRequest peticion,
                                     String solicitante, boolean esGerente) {
        verificarPermiso(documento, solicitante, esGerente, "No puedes editar el perfil de otro usuario");
        Usuario usuario = buscar(documento);

        if (peticion.password() != null) {
            if (peticion.verificarPassword() != null
                    && !peticion.password().equals(peticion.verificarPassword())) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "Las contraseñas no coinciden");
            }
            usuario.cambiarPassword(encoder.encode(peticion.password()));
        }
        if (peticion.nombre() != null) {
            usuario.cambiarNombre(peticion.nombre());
        }
        if (peticion.apellido() != null) {
            usuario.cambiarApellido(peticion.apellido());
        }
        if (peticion.correo() != null) {
            actualizarCorreo(documento, peticion.correo());
        }
        if (peticion.telefono() != null) {
            actualizarTelefono(documento, peticion.telefono());
        }

        boolean cambiaDocumento = peticion.documento() != null && !peticion.documento().equals(documento);
        if (cambiaDocumento && usuarios.existsById(peticion.documento())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT,
                    "El documento ya está registrado por otro usuario");
        }

        em.flush();

        String documentoFinal = documento;
        if (cambiaDocumento) {
            usuarios.cambiarDocumento(documento, peticion.documento());
            documentoFinal = peticion.documento();
            em.clear();
        }

        Usuario actualizado = buscar(documentoFinal);
        PerfilResponse respuesta = respuesta(actualizado);
        avisarPorCorreo(actualizado);
        return respuesta;
    }

    private void actualizarCorreo(String documento, String nuevo) {
        Optional<Correo> yaExiste = correos.findById(nuevo);
        if (yaExiste.isPresent()) {
            if (!yaExiste.get().getDocumento().equals(documento)) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT,
                        "El correo ya está registrado por otro usuario");
            }
            return;
        }
        correos.findFirstByDocumento(documento).ifPresent(correos::delete);
        em.flush();
        correos.save(new Correo(nuevo, documento));
    }

    private void actualizarTelefono(String documento, String nuevo) {
        Optional<Telefono> yaExiste = telefonos.findById(nuevo);
        if (yaExiste.isPresent()) {
            if (!yaExiste.get().getDocumento().equals(documento)) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT,
                        "El teléfono ya está registrado por otro usuario");
            }
            return;
        }
        telefonos.findFirstByDocumento(documento).ifPresent(telefonos::delete);
        em.flush();
        telefonos.save(new Telefono(nuevo, documento));
    }

    private void avisarPorCorreo(Usuario usuario) {
        correos.findFirstByDocumento(usuario.getDocumento()).ifPresent(correo -> {
            try {
                correoService.enviarHtml(correo.getCorreo(), ASUNTO, PLANTILLA,
                        Map.of("nombre", usuario.getNombre()));
            } catch (CorreoException e) {
                log.error("Error enviando el aviso de actualización de perfil", e);
            }
        });
    }

    private void verificarPermiso(String objetivo, String solicitante, boolean esGerente, String mensaje) {
        if (!objetivo.equals(solicitante) && !esGerente) {
            throw new ApiException(HttpStatus.FORBIDDEN, mensaje);
        }
    }

    private Usuario buscar(String documento) {
        return usuarios.findById(documento)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private PerfilResponse respuesta(Usuario usuario) {
        List<PerfilResponse.CorreoPerfil> listaCorreos = correos
                .findAllByDocumento(usuario.getDocumento()).stream()
                .map(c -> new PerfilResponse.CorreoPerfil(c.getCorreo()))
                .toList();

        List<PerfilResponse.TelefonoPerfil> listaTelefonos = telefonos
                .findAllByDocumento(usuario.getDocumento()).stream()
                .map(t -> new PerfilResponse.TelefonoPerfil(t.getTelefono()))
                .toList();

        return new PerfilResponse(
                usuario.getDocumento(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCodEstadoUsuario(),
                new PerfilResponse.RolPerfil(usuario.getRol().getCodRol(), usuario.getRol().getCargo()),
                listaCorreos,
                listaTelefonos);
    }
}
