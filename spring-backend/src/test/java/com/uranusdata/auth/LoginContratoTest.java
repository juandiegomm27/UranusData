package com.uranusdata.auth;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.uranusdata.TestcontainersConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Contrato del login y del logout tal como lo consume Angular. Si una de estas pruebas
 * falla, el frontend se rompe: los nombres de los campos JSON y los codigos de estado
 * son parte del acuerdo con el cliente, no un detalle interno.
 *
 * Los usuarios y la contrasena vienen de la migracion V4__usuarios_prueba.sql.
 *
 * El limite por IP se sube a 1000 a proposito. Todas las pruebas de esta clase comparten
 * un mismo LoginAttemptService, asi que los fallos de unas contarian en el cupo por red de
 * las otras y el resultado dependeria del orden de ejecucion. Ese limite tiene su propia
 * clase, LoginLimiteIpTest.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = "app.login.max-fallos-ip-minuto=1000")
@AutoConfigureMockMvc
class LoginContratoTest {

    private static final String PASSWORD_VALIDA = "1234567890";
    private static final String GERENTE = "1234567892";
    private static final String DOCENTE = "1000000002";
    private static final String INACTIVO = "1000000006";
    private static final String BLOQUEADO = "1000000013";
    private static final String PARA_BLOQUEAR = "1000000003";
    private static final String INEXISTENTE = "9999999999";

    @Autowired
    private MockMvc mvc;

    private static String cuerpo(String documento, String password) {
        return """
                {"documento":"%s","password":"%s"}""".formatted(documento, password);
    }

    private String loginCorrecto(String documento) throws Exception {
        String json = mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(documento, PASSWORD_VALIDA)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.token");
    }

    @Test
    @DisplayName("login correcto: 200 y los nombres de campo exactos que espera Angular")
    void loginCorrecto() throws Exception {
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(GERENTE, PASSWORD_VALIDA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.mensaje").value("Login exitoso"))
                .andExpect(jsonPath("$.usuario.documento").value(GERENTE))
                .andExpect(jsonPath("$.usuario.nombre").exists())
                .andExpect(jsonPath("$.usuario.apellido").exists())
                .andExpect(jsonPath("$.usuario.rol").value("Gerente"))
                // En la BD la columna es cod_estado_usuario y en Java el campo es
                // codEstadoUsuario: el @JsonProperty del DTO es lo que mantiene el contrato.
                .andExpect(jsonPath("$.usuario.cod_estado_usuario").value(1))
                .andExpect(jsonPath("$.usuario.codEstadoUsuario").doesNotExist())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("contrasena incorrecta: 401 sin revelar si el documento existe")
    void passwordIncorrecta() throws Exception {
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(DOCENTE, "noesesta")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("Credenciales inválidas"))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    @DisplayName("documento inexistente: mismo 401 y mismo mensaje que una contrasena mala")
    void documentoInexistente() throws Exception {
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(INEXISTENTE, PASSWORD_VALIDA)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Credenciales inválidas"));
    }

    @Test
    @DisplayName("usuario inactivo: 403, no 401, porque las credenciales si eran correctas")
    void usuarioInactivo() throws Exception {
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(INACTIVO, PASSWORD_VALIDA)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje")
                        .value("Tu usuario está inactivo. Por favor contacta al administrador"));
    }

    @Test
    @DisplayName("usuario bloqueado: 403 con su propio mensaje, distinto del de inactivo")
    void usuarioBloqueado() throws Exception {
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(BLOQUEADO, PASSWORD_VALIDA)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje")
                        .value("Tu usuario está bloqueado. Por favor comunícate con soporte"))
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    @DisplayName("documento invalido: 422 con los errores agrupados por campo")
    void documentoInvalido() throws Exception {
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo("123", PASSWORD_VALIDA)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("Validación fallida"))
                .andExpect(jsonPath("$.errors.documento").isArray())
                .andExpect(jsonPath("$.errors.documento[0]").exists());
    }

    @Test
    @DisplayName("contrasena de mas de 15 caracteres: 422, igual que el maximo de Angular")
    void passwordDemasiadoLarga() throws Exception {
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(GERENTE, "1234567890123456")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors.password").isArray());
    }

    @Test
    @DisplayName("cinco fallos bloquean el documento y el sexto intento responde 429")
    void bloqueoPorDocumento() throws Exception {
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(cuerpo(PARA_BLOQUEAR, "incorrecta")))
                    .andExpect(status().isUnauthorized());
        }

        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(PARA_BLOQUEAR, "incorrecta")))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.mensaje").value(containsString("Demasiados intentos")));

        // El bloqueo es por documento: acertar la contrasena no lo levanta.
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(PARA_BLOQUEAR, PASSWORD_VALIDA)))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    @DisplayName("logout sin token: 401")
    void logoutSinToken() throws Exception {
        mvc.perform(post("/logout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("logout revoca el token: 200, y el mismo token deja de servir en cualquier ruta")
    void logoutRevocaElToken() throws Exception {
        String token = loginCorrecto(GERENTE);

        mvc.perform(post("/logout").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.mensaje").value("Logout exitoso"));

        // Repetir el logout con el token ya revocado.
        mvc.perform(post("/logout").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());

        // Lo que de verdad importa: el token no autentica en ninguna otra ruta.
        // Mientras el LogoutFilter de Spring Security respondia 302, esta prueba fallaba
        // porque el jti nunca llegaba a revocarse.
        mvc.perform(get("/no-existe").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("ruta inexistente: 401 sin token y 404 con token valido")
    void rutaInexistente() throws Exception {
        mvc.perform(get("/no-existe"))
                .andExpect(status().isUnauthorized());

        String token = loginCorrecto(GERENTE);

        mvc.perform(get("/no-existe").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje").value("Recurso no encontrado"));
    }
}
