package com.uranusdata;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Contenedor de PostgreSQL para las pruebas. Es publica para que la puedan importar
 * las pruebas de otros paquetes, por ejemplo com.uranusdata.auth.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    /**
     * Una sola instancia para toda la suite. Cada clase de prueba que use propiedades
     * distintas crea su propio contexto de Spring; si el metodo construyera un contenedor
     * nuevo cada vez, se levantaria un PostgreSQL por contexto.
     *
     * La version se fija igual que en docker-compose.yml. Con "postgres:latest" las pruebas
     * podrian correr contra una version mayor que la de produccion y tapar incompatibilidades.
     */
    private static final PostgreSQLContainer CONTENEDOR =
            new PostgreSQLContainer(DockerImageName.parse("postgres:17-alpine"));

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgresContainer() {
        return CONTENEDOR;
    }

}
