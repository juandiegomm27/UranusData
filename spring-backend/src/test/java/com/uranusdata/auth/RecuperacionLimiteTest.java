package com.uranusdata.auth;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.uranusdata.TestcontainersConfiguration;
import com.uranusdata.shared.mail.CorreoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Limite de solicitudes de recuperacion, equivalente al throttle:5,1 de Laravel.
 * Sin el, el endpoint es un cañon para llenar el buzon de cualquier usuario del
 * colegio, porque basta conocer su documento y su correo.
 *
 * Un solo metodo, porque el contador por IP es compartido por el contexto y dos
 * metodos se pisarian segun el orden de ejecucion.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = "app.recuperacion.max-solicitudes-minuto=2")
@AutoConfigureMockMvc
class RecuperacionLimiteTest {

    @Autowired
    private MockMvc mvc;

    /** Para que las dos primeras solicitudes no intenten hablar con un servidor SMTP. */
    @MockitoBean
    private CorreoService correoService;

    @Test
    @DisplayName("con el limite en 2, la tercera solicitud desde la misma IP responde 429")
    void terceraSolicitudBloqueada() throws Exception {
        String cuerpo = """
                {"documento":"1000000011","correo":"miguel.fuentes@gmail.com"}""";

        for (int i = 0; i < 2; i++) {
            mvc.perform(post("/recuperar-contrasena/solicitar")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(cuerpo))
                    .andExpect(status().isOk());
        }

        mvc.perform(post("/recuperar-contrasena/solicitar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value(containsString("Demasiadas peticiones")));
    }
}
