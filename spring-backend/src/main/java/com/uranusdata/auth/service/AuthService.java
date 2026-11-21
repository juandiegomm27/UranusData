package com.uranusdata.auth.service;

import com.uranusdata.auth.dto.LoginRequest;
import com.uranusdata.auth.dto.LoginResponse;
import com.uranusdata.shared.web.ApiException;
import com.uranusdata.usuarios.domain.Usuario;
import com.uranusdata.usuarios.repository.UsuarioRepository;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final LoginAttemptService intentos;
    // Hash de relleno: el tiempo de respuesta no revela si el documento existe.
    private final String hashFalso;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder encoder,
                       JwtService jwtService, LoginAttemptService intentos) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.intentos = intentos;
        this.hashFalso = encoder.encode(UUID.randomUUID().toString());
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request, String ip) {
        String documento = request.documento();
        intentos.verificarIp(ip);
        intentos.verificarBloqueo(documento);

        Usuario usuario = usuarios.findById(documento).orElse(null);
        boolean coincide = encoder.matches(request.password(),
                usuario != null ? usuario.getPassword() : hashFalso);

        if (usuario == null || !coincide) {
            intentos.registrarFallo(documento, ip);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }

        switch (usuario.getCodEstadoUsuario()) {
            case Usuario.ACTIVO -> { }
            case Usuario.INACTIVO -> throw new ApiException(HttpStatus.FORBIDDEN,
                    "Tu usuario está inactivo. Por favor contacta al administrador");
            case Usuario.BLOQUEADO -> throw new ApiException(HttpStatus.FORBIDDEN,
                    "Tu usuario está bloqueado. Por favor comunícate con soporte");
            default -> throw new ApiException(HttpStatus.FORBIDDEN, "Estado de usuario no válido");
        }

        intentos.limpiar(documento);

        return new LoginResponse(
                true,
                "Login exitoso",
                new LoginResponse.UsuarioLogin(
                        usuario.getDocumento(),
                        usuario.getNombre(),
                        usuario.getApellido(),
                        usuario.getRol().getCargo(),
                        usuario.getCodEstadoUsuario()),
                jwtService.generar(usuario));
    }

    public void logout(Jwt jwt) {
        jwtService.revocar(jwt);
    }
}