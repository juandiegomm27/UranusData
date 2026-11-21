package com.uranusdata.usuarios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.uranusdata.TestcontainersConfiguration;
import com.uranusdata.shared.mail.CorreoService;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
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
 * Contrato del perfil. Lo que lee Angular en editar-perfil.ts es:
 *
 *   const user = response.data;
 *   user.correos[0].correo    y    user.telefonos[0].telefono
 *
 * Cada prueba que modifica algo lo deja como estaba, porque la base de datos del
 * contenedor es compartida por toda la suite y JUnit no garantiza el orden.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class PerfilContratoTest {

    private static final String PASSWORD = "1234567890";
    private static final String DOCENTE = "1234567890";
    private static final String TECNICO = "1234567891";
    private static final String GERENTE = "1234567892";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ITemplateEngine plantillas;

    /** El perfil avisa por correo en cada actualizacion; aqui no se manda nada. */
    @MockitoBean
    private CorreoService correoService;

    private String token(String documento, String password) throws Exception {
        String json = mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"documento":"%s","password":"%s"}""".formatted(documento, password)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.token");
    }

    private String token(String documento) throws Exception {
        return token(documento, PASSWORD);
    }

    @Test
    @DisplayName("perfil propio: 200 con la forma exacta que lee Angular")
    void perfilPropio() throws Exception {
        mvc.perform(get("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(DOCENTE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.mensaje").value("Perfil obtenido correctamente"))
                .andExpect(jsonPath("$.data.documento").value(DOCENTE))
                .andExpect(jsonPath("$.data.nombre").value("Juan Diego"))
                .andExpect(jsonPath("$.data.apellido").value("Medina Mahecha"))
                .andExpect(jsonPath("$.data.cod_estado_usuario").value(1))
                .andExpect(jsonPath("$.data.rol.cargo").value("Docente"))
                .andExpect(jsonPath("$.data.correos").isArray())
                .andExpect(jsonPath("$.data.correos[0].correo").value("1234567890@gmail.com"))
                // Este usuario no tiene telefono en V4. Angular lo tolera porque hace
                // telefonos.length > 0 ? ... : '', y aqui queda documentado.
                .andExpect(jsonPath("$.data.telefonos").isEmpty())
                // La contraseña no sale nunca, ni cifrada.
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    @DisplayName("el perfil nunca incluye el hash de la contrasena")
    void elPerfilNoExponeLaPassword() throws Exception {
        mvc.perform(get("/perfil/{documento}", TECNICO)
                        .header("Authorization", "Bearer " + token(TECNICO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rol.cargo").value("Tecnico"))
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    @DisplayName("otro usuario no puede leer mi perfil: 403, no 200")
    void otroUsuarioNoVeMiPerfil() throws Exception {
        mvc.perform(get("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(TECNICO)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("No puedes ver el perfil de otro usuario"));
    }

    @Test
    @DisplayName("el Gerente si puede leer el perfil de otro")
    void elGerenteVeOtroPerfil() throws Exception {
        mvc.perform(get("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(GERENTE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.documento").value(DOCENTE));
    }

    @Test
    @DisplayName("sin token no hay perfil: 401")
    void sinToken() throws Exception {
        mvc.perform(get("/perfil/{documento}", DOCENTE))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("otro usuario no puede editar mi perfil: 403")
    void otroUsuarioNoEditaMiPerfil() throws Exception {
        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(TECNICO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Intruso"}"""))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("No puedes editar el perfil de otro usuario"));
    }

    @Test
    @DisplayName("contrasena de mas de 15: 422, el mismo maximo que el login")
    void passwordDemasiadoLarga() throws Exception {
        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(DOCENTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"password":"1234567890123456","verificarPassword":"1234567890123456"}"""))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.mensaje").value("Validación fallida"))
                .andExpect(jsonPath("$.errors.password").isArray());
    }

    @Test
    @DisplayName("la verificacion no coincide: 422 aunque Angular ya lo compruebe")
    void verificacionDistinta() throws Exception {
        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(DOCENTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"password":"nueva123","verificarPassword":"otra456"}"""))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.mensaje").value("Las contraseñas no coinciden"));
    }

    @Test
    @DisplayName("el correo de otro usuario: 422, no un 500 por clave duplicada")
    void correoDeOtroUsuario() throws Exception {
        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(DOCENTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"correo":"1234567891@gmail.com"}"""))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.mensaje").value("El correo ya está registrado por otro usuario"));
    }

    @Test
    @DisplayName("el formulario intacto de Angular no cambia nada: telefono y password en blanco")
    void camposEnBlancoNoCambianNada() throws Exception {
        // Exactamente lo que manda getRawValue() cuando el usuario no toca esos campos.
        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(DOCENTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"documento":"1234567890","nombre":"Juan Diego","apellido":"Medina Mahecha",\
                                "correo":"1234567890@gmail.com","telefono":"","password":"","verificarPassword":""}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nombre").value("Juan Diego"))
                .andExpect(jsonPath("$.data.telefonos").isEmpty());

        // La contraseña sigue siendo la de siempre: el password en blanco no la toco.
        assertThat(token(DOCENTE)).isNotBlank();
    }

    @Test
    @DisplayName("cambiar nombre y apellido, y dejarlos como estaban")
    void cambiarNombreYApellido() throws Exception {
        String jwt = token(DOCENTE);

        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Juanito","apellido":"Medina"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Perfil actualizado correctamente"))
                .andExpect(jsonPath("$.data.nombre").value("Juanito"))
                .andExpect(jsonPath("$.data.apellido").value("Medina"));

        mvc.perform(get("/perfil/{documento}", DOCENTE).header("Authorization", "Bearer " + jwt))
                .andExpect(jsonPath("$.data.nombre").value("Juanito"));

        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Juan Diego","apellido":"Medina Mahecha"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nombre").value("Juan Diego"));
    }

    @Test
    @DisplayName("cambiar la contrasena: entra la nueva, y se deja otra vez la de siempre")
    void cambiarPassword() throws Exception {
        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(DOCENTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"password":"nueva123","verificarPassword":"nueva123"}"""))
                .andExpect(status().isOk());

        String jwtNuevo = token(DOCENTE, "nueva123");

        mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"documento":"1234567890","password":"1234567890"}"""))
                .andExpect(status().isUnauthorized());

        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + jwtNuevo)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"password":"1234567890","verificarPassword":"1234567890"}"""))
                .andExpect(status().isOk());

        assertThat(token(DOCENTE)).isNotBlank();
    }

    @Test
    @DisplayName("cambiar el documento arrastra las filas hijas y mata el token viejo")
    void cambiarDocumento() throws Exception {
        String nuevo = "9000000001";
        String jwtGerente = token(GERENTE);
        String jwtDelDocente = token(DOCENTE);

        // Lo hace el Gerente para conservar un token valido con el que comprobar.
        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + jwtGerente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"documento":"%s"}""".formatted(nuevo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.documento").value(nuevo))
                // El ON UPDATE CASCADE de la clave ajena movio la fila de correo sola.
                .andExpect(jsonPath("$.data.correos[0].correo").value("1234567890@gmail.com"));

        mvc.perform(get("/perfil/{documento}", DOCENTE).header("Authorization", "Bearer " + jwtGerente))
                .andExpect(status().isNotFound());

        mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"documento":"%s","password":"%s"}""".formatted(nuevo, PASSWORD)))
                .andExpect(status().isOk());

        // El token que se emitio para el documento viejo deja de autenticar en el acto,
        // porque JwtUsuarioConverter busca al usuario en la base en cada peticion.
        mvc.perform(get("/perfil/{documento}", nuevo).header("Authorization", "Bearer " + jwtDelDocente))
                .andExpect(status().isUnauthorized());

        // Se deja como estaba.
        mvc.perform(put("/perfil/{documento}", nuevo)
                        .header("Authorization", "Bearer " + jwtGerente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"documento":"%s"}""".formatted(DOCENTE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.documento").value(DOCENTE));
    }

    @Test
    @DisplayName("documento con formato invalido: 422")
    void documentoInvalido() throws Exception {
        mvc.perform(put("/perfil/{documento}", DOCENTE)
                        .header("Authorization", "Bearer " + token(DOCENTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"documento":"123"}"""))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors.documento").isArray());
    }

    @Test
    @DisplayName("la plantilla del aviso de perfil se resuelve")
    void plantillaDeAviso() {
        Context contexto = new Context();
        contexto.setVariables(Map.of("nombre", "Juan Diego"));

        String html = plantillas.process("correo/perfil-actualizado", contexto);

        assertThat(html)
                .contains("Juan Diego")
                .contains("Actualización de Perfil")
                .doesNotContain("th:text");
    }
}
