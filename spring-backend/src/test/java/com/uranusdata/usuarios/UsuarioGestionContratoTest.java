package com.uranusdata.usuarios;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.uranusdata.TestcontainersConfiguration;
import com.uranusdata.shared.mail.CorreoService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Contrato de la gestion de usuarios. Angular lee response.data como lista y
 * response.pagination.total, .last_page y .current_page.
 *
 * Solo el Gerente entra. En Laravel estas rutas eran Gerente y Tecnico; el cambio
 * es deliberado y hay una prueba que lo fija.
 *
 * Las pruebas que crean usuarios usan documentos de la serie 8xxxxxxxxx y los borran
 * al terminar, porque la base del contenedor es compartida por toda la suite.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class UsuarioGestionContratoTest {

    private static final String PASSWORD = "1234567890";
    private static final String GERENTE = "1234567892";
    private static final String DOCENTE = "1234567890";
    private static final String TECNICO = "1234567891";
    private static final String BASE = "/gestion/usuario";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @MockitoBean
    private CorreoService correoService;

    private String token(String documento) throws Exception {
        String json = mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"documento":"%s","password":"%s"}""".formatted(documento, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.token");
    }

    private static String nuevoUsuario(String documento, String correo, String telefono, int rol) {
        return """
                {"documento":"%s","nombre":"Prueba","apellido":"Temporal",\
                "correo":"%s","telefono":"%s","cod_rol":%d}"""
                .formatted(documento, correo, telefono, rol);
    }

    /** Borra a mano lo que una prueba haya dejado, sin pasar por la API. */
    private void limpiar(String documento) {
        jdbc.update("DELETE FROM reserva WHERE documento = ?", documento);
        jdbc.update("DELETE FROM usuario WHERE documento = ?", documento);
    }

    @Test
    @DisplayName("listado: 200 con data y el bloque pagination que lee Angular")
    void listadoComoGerente() throws Exception {
        mvc.perform(get(BASE).header("Authorization", "Bearer " + token(GERENTE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].documento").exists())
                .andExpect(jsonPath("$.data[0].cod_rol").exists())
                .andExpect(jsonPath("$.data[0].cod_estado_usuario").exists())
                .andExpect(jsonPath("$.data[0].rol.cargo").exists())
                .andExpect(jsonPath("$.data[0].estado.estado").exists())
                .andExpect(jsonPath("$.data[0].correos").isArray())
                .andExpect(jsonPath("$.data[0].password").doesNotExist())
                .andExpect(jsonPath("$.pagination.total").exists())
                .andExpect(jsonPath("$.pagination.per_page").value(10))
                .andExpect(jsonPath("$.pagination.current_page").value(1))
                .andExpect(jsonPath("$.pagination.last_page").exists());
    }

    @Test
    @DisplayName("un Docente no entra en la gestion de usuarios: 403")
    void elDocenteNoEntra() throws Exception {
        mvc.perform(get(BASE).header("Authorization", "Bearer " + token(DOCENTE)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("un Tecnico tampoco entra: es la diferencia deliberada con Laravel")
    void elTecnicoNoEntra() throws Exception {
        mvc.perform(get(BASE).header("Authorization", "Bearer " + token(TECNICO)))
                .andExpect(status().isForbidden());

        mvc.perform(post(BASE)
                        .header("Authorization", "Bearer " + token(TECNICO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevoUsuario("8000000009", "no.deberia@gmail.com", "3001110009", 1)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("sin token: 401")
    void sinToken() throws Exception {
        mvc.perform(get(BASE)).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("filtros por rol y por estado")
    void filtros() throws Exception {
        String jwt = token(GERENTE);

        String soloGerentes = mvc.perform(get(BASE).param("rol", "3")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        List<Integer> roles = JsonPath.read(soloGerentes, "$.data[*].cod_rol");
        assertThat(roles).isNotEmpty().allMatch(r -> r == 3);

        String soloInactivos = mvc.perform(get(BASE).param("estado", "2")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        List<Integer> estados = JsonPath.read(soloInactivos, "$.data[*].cod_estado_usuario");
        assertThat(estados).isNotEmpty().allMatch(e -> e == 2);
    }

    @Test
    @DisplayName("la busqueda no distingue mayusculas, como el LIKE de MySQL")
    void busquedaSinDistinguirMayusculas() throws Exception {
        String json = mvc.perform(get(BASE).param("busqueda", "carlos")
                        .header("Authorization", "Bearer " + token(GERENTE)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        List<String> nombres = JsonPath.read(json, "$.data[*].nombre");
        assertThat(nombres).contains("Carlos");
    }

    @Test
    @DisplayName("per_page se tope en 100 aunque pidan 500")
    void perPageConTope() throws Exception {
        mvc.perform(get(BASE).param("per_page", "500")
                        .header("Authorization", "Bearer " + token(GERENTE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pagination.per_page").value(100));
    }

    @Test
    @DisplayName("paginas ordenadas: la 1 y la 2 no comparten usuarios")
    void paginasSinSolaparse() throws Exception {
        String jwt = token(GERENTE);

        String pagina1 = mvc.perform(get(BASE).param("page", "1").param("per_page", "5")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String pagina2 = mvc.perform(get(BASE).param("page", "2").param("per_page", "5")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();

        List<String> documentos1 = JsonPath.read(pagina1, "$.data[*].documento");
        List<String> documentos2 = JsonPath.read(pagina2, "$.data[*].documento");

        assertThat(documentos1).hasSize(5);
        assertThat(documentos2).isNotEmpty().doesNotContainAnyElementsOf(documentos1);
    }

    @Test
    @DisplayName("usuario inexistente: 404")
    void usuarioInexistente() throws Exception {
        mvc.perform(get(BASE + "/9999999999").header("Authorization", "Bearer " + token(GERENTE)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje").value("Usuario no encontrado"));
    }

    @Test
    @DisplayName("catalogos de estados y roles con los nombres de la base")
    void catalogos() throws Exception {
        String jwt = token(GERENTE);

        mvc.perform(get(BASE + "/estados/list").header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].cod_estado_usuario").exists())
                .andExpect(jsonPath("$.data[0].estado").exists());

        mvc.perform(get(BASE + "/rol/list").header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].cod_rol").exists())
                .andExpect(jsonPath("$.data[0].cargo").exists());
    }

    @Test
    @DisplayName("alta: nace ACTIVO y puede iniciar sesion con la clave por defecto")
    void crearUsuario() throws Exception {
        String documento = "8000000001";
        try {
            mvc.perform(post(BASE)
                            .header("Authorization", "Bearer " + token(GERENTE))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(nuevoUsuario(documento, "nuevo.usuario@gmail.com", "3001110001", 1)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.documento").value(documento))
                    // Laravel lo creaba con estado 2; asi la cuenta no servia para nada.
                    .andExpect(jsonPath("$.data.cod_estado_usuario").value(1))
                    .andExpect(jsonPath("$.data.rol.cargo").value("Docente"))
                    .andExpect(jsonPath("$.data.correos[0].correo").value("nuevo.usuario@gmail.com"))
                    .andExpect(jsonPath("$.data.telefonos[0].telefono").value("3001110001"));

            mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"documento":"%s","password":"1234567890"}""".formatted(documento)))
                    .andExpect(status().isOk());
        } finally {
            limpiar(documento);
        }
    }

    @Test
    @DisplayName("documento, correo o telefono repetidos: 422")
    void duplicados() throws Exception {
        String jwt = token(GERENTE);

        mvc.perform(post(BASE).header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevoUsuario(DOCENTE, "libre@gmail.com", "3009990001", 1)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.mensaje").value("El documento ya está registrado"));

        mvc.perform(post(BASE).header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevoUsuario("8000000005", "1234567890@gmail.com", "3009990002", 1)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.mensaje").value("El correo ya está registrado"));
    }

    @Test
    @DisplayName("rol inexistente: 422, no un 500 por clave ajena")
    void rolInexistente() throws Exception {
        mvc.perform(post(BASE).header("Authorization", "Bearer " + token(GERENTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevoUsuario("8000000006", "rol.malo@gmail.com", "3009990003", 99)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.mensaje").value("El rol indicado no existe"));
    }

    @Test
    @DisplayName("desactivar a un usuario le cierra la puerta de inmediato")
    void desactivarUsuario() throws Exception {
        String documento = "8000000002";
        String jwt = token(GERENTE);
        try {
            mvc.perform(post(BASE).header("Authorization", "Bearer " + jwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(nuevoUsuario(documento, "a.desactivar@gmail.com", "3001110002", 1)))
                    .andExpect(status().isCreated());

            mvc.perform(put(BASE + "/" + documento).header("Authorization", "Bearer " + jwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"cod_estado_usuario":2}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.cod_estado_usuario").value(2))
                    .andExpect(jsonPath("$.data.estado.estado").value("Inactivo"));

            mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"documento":"%s","password":"1234567890"}""".formatted(documento)))
                    .andExpect(status().isForbidden());
        } finally {
            limpiar(documento);
        }
    }

    @Test
    @DisplayName("estado fuera de 1..3: 422, Laravel aceptaba cualquier entero")
    void estadoFueraDeRango() throws Exception {
        mvc.perform(put(BASE + "/" + DOCENTE).header("Authorization", "Bearer " + token(GERENTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cod_estado_usuario":99}"""))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.errors.cod_estado_usuario").isArray());
    }

    @Test
    @DisplayName("el Gerente no puede dejarse a si mismo inactivo: 409")
    void noSePuedeDesactivarASiMismo() throws Exception {
        mvc.perform(put(BASE + "/" + GERENTE).header("Authorization", "Bearer " + token(GERENTE))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cod_estado_usuario":2}"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje")
                        .value("No puedes dejar tu propio usuario inactivo o bloqueado"));
    }

    @Test
    @DisplayName("el Gerente no puede borrarse a si mismo: 409")
    void noSePuedeBorrarASiMismo() throws Exception {
        mvc.perform(delete(BASE + "/" + GERENTE).header("Authorization", "Bearer " + token(GERENTE)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").value("No puedes eliminar tu propio usuario"));
    }

    @Test
    @DisplayName("borrar un usuario sin dependencias: 200 y deja de existir")
    void borrarUsuario() throws Exception {
        String documento = "8000000003";
        String jwt = token(GERENTE);

        mvc.perform(post(BASE).header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevoUsuario(documento, "a.borrar@gmail.com", "3001110003", 2)))
                .andExpect(status().isCreated());

        mvc.perform(delete(BASE + "/" + documento).header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Usuario eliminado correctamente"));

        mvc.perform(get(BASE + "/" + documento).header("Authorization", "Bearer " + jwt))
                .andExpect(status().isNotFound());

        // El correo y el telefono se fueron con el usuario por ON DELETE CASCADE.
        assertThat(jdbc.queryForObject(
                "SELECT count(*) FROM correo WHERE documento = ?", Integer.class, documento))
                .isZero();
    }

    @Test
    @DisplayName("borrar un usuario con reservas: 409 con mensaje claro, no un 500 del motor")
    void borrarUsuarioConReservas() throws Exception {
        String documento = "8000000004";
        String jwt = token(GERENTE);
        try {
            mvc.perform(post(BASE).header("Authorization", "Bearer " + jwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(nuevoUsuario(documento, "con.reservas@gmail.com", "3001110004", 1)))
                    .andExpect(status().isCreated());

            // reserva referencia a usuario sin ON DELETE CASCADE, asi que el borrado
            // choca con la clave ajena.
            jdbc.update("INSERT INTO reserva (num_estado, documento, fecha) VALUES (1, ?, CURRENT_DATE)",
                    documento);

            mvc.perform(delete(BASE + "/" + documento).header("Authorization", "Bearer " + jwt))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.mensaje").value(
                            "No se puede eliminar el usuario porque tiene reservas o mantenimientos asociados"));

            // Sigue ahi: el 409 no borro nada a medias.
            mvc.perform(get(BASE + "/" + documento).header("Authorization", "Bearer " + jwt))
                    .andExpect(status().isOk());
        } finally {
            limpiar(documento);
        }
    }
}
