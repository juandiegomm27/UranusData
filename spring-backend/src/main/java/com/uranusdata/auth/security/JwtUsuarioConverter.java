package com.uranusdata.auth.security;

import com.uranusdata.auth.service.JwtService;
import com.uranusdata.usuarios.domain.Usuario;
import com.uranusdata.usuarios.repository.UsuarioRepository;
import java.util.List;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.AbstractOAuth2TokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.security.authentication.AbstractAuthenticationToken;

@Component
public class JwtUsuarioConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UsuarioRepository usuarios;
    private final JwtService jwtService;

    public JwtUsuarioConverter(UsuarioRepository usuarios, JwtService jwtService) {
        this.usuarios = usuarios;
        this.jwtService = jwtService;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        if (jwtService.estaRevocado(jwt)) {
            throw new BadCredentialsException("Token revocado");
        }
        Usuario usuario = usuarios.findById(jwt.getSubject())
                .orElseThrow(() -> new BadCredentialsException("Usuario inexistente"));
        if (usuario.getCodEstadoUsuario() != Usuario.ACTIVO) {
            throw new BadCredentialsException("Usuario inactivo o bloqueado");
        }
        return new JwtAuthenticationToken(
                jwt,
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getCargo())),
                usuario.getDocumento());
    }
}