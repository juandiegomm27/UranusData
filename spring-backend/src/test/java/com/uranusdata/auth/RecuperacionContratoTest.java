package com.uranusdata.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.uranusdata.TestcontainersConfiguration;
import com.uranusdata.auth.domain.PasswordResetToken;
import com.uranusdata.auth.repository.PasswordResetTokenRepository;
import com.uranusdata.shared.mail.CorreoService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Contrato de recuperar contraseña. No se manda ningun correo de verdad: CorreoService
 * esta sustituido por un doble, del que se saca el enlace para seguir el flujo.
 *
 * Los limites por minuto se suben porque varias pruebas piden enlaces y se quitarian
 * el cupo entre ellas; el 429 tiene su propia clase, RecuperacionLimiteTest.
 *
 * Cada prueba que cambia una contraseña usa un usuario distinto, para que el orden en
 * que JUnit las ejecute no importe. La base de datos del contenedor es compartida.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "app.recuperacion.max-solicitudes-minuto=100",
        "app.recuperacion.max-verificaciones-minuto=100"
})
@AutoConfigureMockMvc
class RecuperacionContratoTest {

    private static final String PLANTILLA = "correo/recuperar-contrasena";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private PasswordResetTokenRepository tokens;

    @Autowired
    private ITemplateEngine plantillas;

    @MockitoBean
    private CorreoService correoService;

    private static String sha256(String texto) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(sha.digest(texto.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String solicitud(String documento, String correo) {
        return """
                {"documento":"%s","correo":"%s"}""".formatted(documento, correo);
    }

    private static String confirmacion(String token, String password, String confirmPassword) {
        return """
                {"token":"%s","password":"%s","confirmPassword":"%s"}"""
                .formatted(token, password, confirmPassword);
    }

    private static String login(String documento, String password) {
        return """
                {"documento":"%s","password":"%s"}""".formatted(documento, password);
    }

    /** Pide el enlace y devuelve el token en claro, sacado del correo que se habria enviado. */
    private String pedirEnlace(String documento, String correo) throws Exception {
        mvc.perform(post("/recuperar-contrasena/solicitar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitud(documento, correo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.mensaje").exists());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> variables = ArgumentCaptor.forClass(Map.class);
        verify(correoService).enviarHtml(eq(correo), anyString(), eq(PLANTILLA), variables.capture());

        String enlace = (String) variables.getValue().get("enlace");
        assertThat(enlace).contains("/recuperar-contrasena?token=");
        return enlace.substring(enlace.indexOf("token=") + "token=".length());
    }

    @Test
    @DisplayName("flujo completo: el enlace cambia la contraseña y el token queda gastado")
    void flujoCompleto() throws Exception {
        String documento = "1000000004";
        String token = pedirEnlace(documento, "ana.sanchez@gmail.com");

        // En la tabla no esta el token, esta su SHA-256.
        PasswordResetToken guardado = tokens.findById(documento).orElseThrow();
        assertThat(guardado.getTokenHash()).isNotEqualTo(token).hasSize(64).isEqualTo(sha256(token));

        mvc.perform(get("/recuperar-contrasena/verificar/{token}", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.usuario.documento").value(documento))
                .andExpect(jsonPath("$.usuario.nombre").value("Ana"))
                .andExpect(jsonPath("$.usuario.cod_estado_usuario").value(1));

        mvc.perform(post("/recuperar-contrasena/confirmar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(confirmacion(token, "nueva123", "nueva123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // La contraseña nueva entra y la vieja ya no.
        mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                        .content(login(documento, "nueva123")))
                .andExpect(status().isOk());
        mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                        .content(login(documento, "1234567890")))
                .andExpect(status().isUnauthorized());

        // El enlace no sirve dos veces.
        assertThat(tokens.findById(documento)).isEmpty();
        mvc.perform(get("/recuperar-contrasena/verificar/{token}", token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("el correo no es el del documento: 404 y no se manda nada")
    void correoQueNoCoincide() throws Exception {
        mvc.perform(post("/recuperar-contrasena/solicitar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitud("1000000005", "otro.correo@gmail.com")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("El documento y el correo no coinciden"));
    }

    @Test
    @DisplayName("usuario inactivo: 403, no puede recuperar contraseña")
    void usuarioInactivo() throws Exception {
        mvc.perform(post("/recuperar-contrasena/solicitar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitud("1000000006", "laura.jimenez@gmail.com")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje")
                        .value("Tu usuario está inactivo. No puedes recuperar contraseña"));
    }

    @Test
    @DisplayName("usuario bloqueado: 403 remitiendo a soporte")
    void usuarioBloqueado() throws Exception {
        mvc.perform(post("/recuperar-contrasena/solicitar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitud("1000000013", "ricardo.pena@gmail.com")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje")
                        .value("Tu cuenta está bloqueada. Contacta a soporte."));
    }

    @Test
    @DisplayName("documento con formato invalido: 422 antes de tocar la base de datos")
    void documentoInvalido() throws Exception {
        mvc.perform(post("/recuperar-contrasena/solicitar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitud("123", "ana.sanchez@gmail.com")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors.documento").isArray());
    }

    @Test
    @DisplayName("correo con formato invalido: 422")
    void correoInvalido() throws Exception {
        mvc.perform(post("/recuperar-contrasena/solicitar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitud("1000000004", "esto-no-es-un-correo")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors.correo").isArray());
    }

    @Test
    @DisplayName("token inexistente: 404")
    void tokenInvalido() throws Exception {
        mvc.perform(get("/recuperar-contrasena/verificar/{token}", "noexisteestetoken"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje").value("Token inválido o expirado"));
    }

    @Test
    @DisplayName("token expirado: 410, y pedir uno nuevo sobrescribe la fila vencida")
    void tokenExpirado() throws Exception {
        String documento = "1000000012";
        String vencido = "token-ya-vencido-de-prueba";
        tokens.save(new PasswordResetToken(documento, sha256(vencido),
                Instant.now().minusSeconds(60)));

        mvc.perform(get("/recuperar-contrasena/verificar/{token}", vencido))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.mensaje").value("Token expirado. Solicita uno nuevo."));

        // La fila vencida sigue ahi: no se puede borrar y lanzar la excepcion a la vez,
        // porque la excepcion deshace la transaccion. No estorba, porque ya no abre nada.
        assertThat(tokens.findById(documento)).isPresent();

        // Lo que de verdad importa: pedir otro enlace la reemplaza, no la duplica.
        String nuevo = pedirEnlace(documento, "gabriela.medina@gmail.com");
        assertThat(tokens.findById(documento).orElseThrow().getTokenHash())
                .isEqualTo(sha256(nuevo))
                .isNotEqualTo(sha256(vencido));

        mvc.perform(get("/recuperar-contrasena/verificar/{token}", nuevo))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("contrasena de mas de 15: 422, el mismo maximo que exige el login")
    void passwordDemasiadoLarga() throws Exception {
        mvc.perform(post("/recuperar-contrasena/confirmar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(confirmacion("cualquiera", "1234567890123456", "1234567890123456")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors.password").isArray());
    }

    @Test
    @DisplayName("confirmacion distinta: 422 aunque Angular ya lo comprobara")
    void confirmPasswordDistinta() throws Exception {
        mvc.perform(post("/recuperar-contrasena/confirmar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(confirmacion("cualquiera", "nueva123", "otra456")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.mensaje").value("Las contraseñas no coinciden"));
    }

    @Test
    @DisplayName("las tres rutas son publicas: ninguna responde 401 sin token JWT")
    void rutasPublicas() throws Exception {
        mvc.perform(get("/recuperar-contrasena/verificar/{token}", "cualquiera"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("la plantilla Thymeleaf se resuelve y pinta el nombre y el enlace")
    void plantillaSeRenderiza() {
        Context contexto = new Context();
        contexto.setVariables(Map.of(
                "nombre", "Ana",
                "enlace", "http://localhost:4200/recuperar-contrasena?token=abc123",
                "minutos", 60L));

        String html = plantillas.process(PLANTILLA, contexto);

        assertThat(html)
                .contains("Ana")
                .contains("http://localhost:4200/recuperar-contrasena?token=abc123")
                .contains("60 minutos")
                .doesNotContain("th:text");
    }
}
