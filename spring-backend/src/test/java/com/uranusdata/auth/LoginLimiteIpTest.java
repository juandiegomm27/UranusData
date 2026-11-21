package com.uranusdata.auth;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.uranusdata.TestcontainersConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;

/**
 * Limite de fallos por IP, en su propia clase porque necesita valores distintos a los del
 * resto de las pruebas.
 *
 * max-intentos se sube a 100 para que el bloqueo por documento no salte primero y tape
 * el limite que se quiere comprobar aqui.
 *
 * Esta regla es la que se corrigio respecto a Laravel: Laravel contaba todos los intentos
 * de una IP, acertados incluidos, asi que una red compartida (una sala del colegio con una
 * sola salida a internet) se bloqueaba sola. Aqui solo cuentan los FALLOS.
 *
 * Va todo en un unico metodo a proposito. El contador de la IP es un mapa en memoria
 * compartido por el contexto de Spring, asi que dos metodos de prueba se pisarian segun
 * el orden en que JUnit los ejecutara.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "app.login.max-fallos-ip-minuto=3",
        "app.login.max-intentos=100"
})
@AutoConfigureMockMvc
class LoginLimiteIpTest {

    private static final String PASSWORD_VALIDA = "1234567890";
    private static final String GERENTE = "1234567892";

    @Autowired
    private MockMvc mvc;

    private static String cuerpo(String documento, String password) {
        return """
                {"documento":"%s","password":"%s"}""".formatted(documento, password);
    }

    private void login(String documento, String password, ResultMatcher esperado) throws Exception {
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo(documento, password)))
                .andExpect(esperado);
    }

    @Test
    @DisplayName("solo los fallos gastan el cupo de la IP: cuatro aciertos pasan, el cuarto fallo da 429")
    void soloLosFallosGastanElCupoDeLaIp() throws Exception {
        // 1. Cuatro logins correctos con el limite en 3. Si los aciertos contaran,
        //    el cuarto responderia 429 en vez de 200.
        for (int i = 0; i < 4; i++) {
            login(GERENTE, PASSWORD_VALIDA, status().isOk());
        }

        // 2. Tres fallos, con documentos distintos para que lo que se agote sea el cupo
        //    de la IP y no el de un documento concreto.
        login("1000000007", "incorrecta", status().isUnauthorized());
        login("1000000008", "incorrecta", status().isUnauthorized());
        login("1000000009", "incorrecta", status().isUnauthorized());

        // 3. El cuarto fallo ya encuentra el cupo agotado.
        mvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo("1000000010", "incorrecta")))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value(containsString("desde tu red")));
    }
}
