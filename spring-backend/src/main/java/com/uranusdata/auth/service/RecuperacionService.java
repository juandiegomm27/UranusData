package com.uranusdata.auth.service;

import com.uranusdata.auth.domain.PasswordResetToken;
import com.uranusdata.auth.dto.ConfirmarRecuperacionRequest;
import com.uranusdata.auth.dto.SolicitarRecuperacionRequest;
import com.uranusdata.auth.dto.VerificarTokenResponse;
import com.uranusdata.auth.repository.PasswordResetTokenRepository;
import com.uranusdata.shared.mail.CorreoException;
import com.uranusdata.shared.mail.CorreoService;
import com.uranusdata.shared.web.ApiException;
import com.uranusdata.shared.web.LimitePeticionesService;
import com.uranusdata.usuarios.domain.Correo;
import com.uranusdata.usuarios.domain.Usuario;
import com.uranusdata.usuarios.repository.CorreoRepository;
import com.uranusdata.usuarios.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Recuperacion de contraseña por correo, en tres pasos: pedir el enlace,
 * verificar el token al abrirlo y confirmar la contraseña nueva.
 *
 * Del token solo se guarda su SHA-256. El token en claro existe unicamente
 * dentro del enlace que recibe el usuario; ni el log ni la respuesta JSON lo
 * contienen, y la base de datos tampoco.
 */
@Service
public class RecuperacionService {

    private static final Logger log = LoggerFactory.getLogger(RecuperacionService.class);

    private static final String ACCION_SOLICITAR = "recuperar-solicitar";
    private static final String ACCION_VERIFICAR = "recuperar-verificar";
    private static final String ACCION_CONFIRMAR = "recuperar-confirmar";

    private static final String ASUNTO = "Recuperación de Contraseña - UranusData";
    private static final String PLANTILLA = "correo/recuperar-contrasena";

    private final UsuarioRepository usuarios;
    private final CorreoRepository correos;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder encoder;
    private final CorreoService correoService;
    private final LimitePeticionesService limite;

    private final Duration expiracion;
    private final int maxSolicitudes;
    private final int maxVerificaciones;
    private final String frontendUrl;

    private final SecureRandom aleatorio = new SecureRandom();

    public RecuperacionService(UsuarioRepository usuarios, CorreoRepository correos,
                               PasswordResetTokenRepository tokens, PasswordEncoder encoder,
                               CorreoService correoService, LimitePeticionesService limite,
                               @Value("${app.recuperacion.expiracion-minutos}") long expiracionMinutos,
                               @Value("${app.recuperacion.max-solicitudes-minuto}") int maxSolicitudes,
                               @Value("${app.recuperacion.max-verificaciones-minuto}") int maxVerificaciones,
                               @Value("${app.frontend-url}") String frontendUrl) {
        this.usuarios = usuarios;
        this.correos = correos;
        this.tokens = tokens;
        this.encoder = encoder;
        this.correoService = correoService;
        this.limite = limite;
        this.expiracion = Duration.ofMinutes(expiracionMinutos);
        this.maxSolicitudes = maxSolicitudes;
        this.maxVerificaciones = maxVerificaciones;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Crea el token y manda el enlace. Si el correo no sale, la transaccion se
     * deshace y el token no queda guardado: no tiene sentido dejar vivo un enlace
     * que el usuario nunca recibio.
     */
    @Transactional
    public void solicitar(SolicitarRecuperacionRequest peticion, String ip) {
        limite.verificar(ACCION_SOLICITAR, ip, maxSolicitudes);

        Correo correo = correos
                .findByDocumentoAndCorreoIgnoreCase(peticion.documento(), peticion.correo())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "El documento y el correo no coinciden"));

        Usuario usuario = usuarios.findById(peticion.documento())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        switch (usuario.getCodEstadoUsuario()) {
            case Usuario.ACTIVO -> { }
            case Usuario.INACTIVO -> throw new ApiException(HttpStatus.FORBIDDEN,
                    "Tu usuario está inactivo. No puedes recuperar contraseña");
            case Usuario.BLOQUEADO -> throw new ApiException(HttpStatus.FORBIDDEN,
                    "Tu cuenta está bloqueada. Contacta a soporte.");
            default -> throw new ApiException(HttpStatus.FORBIDDEN, "Estado de usuario no válido");
        }

        String token = tokenNuevo();
        String tokenHash = hash(token);
        Instant expira = Instant.now().plus(expiracion);

        // La clave primaria es el documento, asi que pedir un enlace nuevo
        // invalida el anterior en vez de acumular tokens.
        tokens.findById(usuario.getDocumento()).ifPresentOrElse(
                existente -> existente.renovar(tokenHash, expira),
                () -> tokens.save(new PasswordResetToken(usuario.getDocumento(), tokenHash, expira)));

        try {
            correoService.enviarHtml(correo.getCorreo(), ASUNTO, PLANTILLA, Map.of(
                    "nombre", usuario.getNombre(),
                    "enlace", frontendUrl + "/recuperar-contrasena?token=" + token,
                    "minutos", expiracion.toMinutes()));
        } catch (CorreoException e) {
            // Sin datos personales en el log: basta con saber que fallo el envio.
            log.error("Error enviando el correo de recuperación", e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al enviar el correo electrónico. Intenta nuevamente más tarde.");
        }
    }

    @Transactional
    public VerificarTokenResponse verificar(String token, String ip) {
        limite.verificar(ACCION_VERIFICAR, ip, maxVerificaciones);

        PasswordResetToken registro = buscarVigente(token);
        Usuario usuario = usuarios.findById(registro.getDocumento())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return new VerificarTokenResponse(true, "Token válido",
                new VerificarTokenResponse.UsuarioRecuperacion(
                        usuario.getDocumento(),
                        usuario.getNombre(),
                        usuario.getApellido(),
                        usuario.getCodEstadoUsuario()));
    }

    @Transactional
    public void confirmar(ConfirmarRecuperacionRequest peticion, String ip) {
        limite.verificar(ACCION_CONFIRMAR, ip, maxSolicitudes);

        // Angular ya lo comprueba, pero el navegador no es una garantia:
        // cualquiera puede llamar al endpoint sin pasar por la pantalla.
        if (!peticion.password().equals(peticion.confirmPassword())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "Las contraseñas no coinciden");
        }

        PasswordResetToken registro = buscarVigente(peticion.token());
        Usuario usuario = usuarios.findById(registro.getDocumento())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (usuario.getCodEstadoUsuario() == Usuario.BLOQUEADO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tu cuenta está bloqueada. Contacta a soporte.");
        }

        usuario.cambiarPassword(encoder.encode(peticion.password()));

        // El token se gasta: el mismo enlace no sirve dos veces.
        tokens.delete(registro);
    }

    /**
     * Token vigente o excepcion.
     *
     * El registro expirado NO se borra aqui. Borrarlo y lanzar la excepcion a
     * continuacion no sirve de nada: la excepcion deshace la transaccion y con ella
     * el borrado. Y tampoco hace falta: la clave primaria es el documento, asi que
     * cada usuario tiene como maximo una fila, un token expirado ya no abre nada y
     * la siguiente solicitud lo sobrescribe.
     */
    private PasswordResetToken buscarVigente(String token) {
        PasswordResetToken registro = tokens.findByTokenHash(hash(token))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Token inválido o expirado"));

        if (registro.estaExpirado(Instant.now())) {
            throw new ApiException(HttpStatus.GONE, "Token expirado. Solicita uno nuevo.");
        }
        return registro;
    }

    /** 32 bytes aleatorios en hexadecimal: 64 caracteres. */
    private String tokenNuevo() {
        byte[] bytes = new byte[32];
        aleatorio.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    /** SHA-256 en hexadecimal: 64 caracteres, lo que cabe en token_hash. */
    private static String hash(String token) {
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(sha256.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no está disponible en esta JVM", e);
        }
    }
}
