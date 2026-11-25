package com.uranusdata.inventario.equipos.dto;

import com.uranusdata.inventario.equipos.domain.Equipo;
import java.util.Locale;
import java.util.function.Predicate;

/**
 * Los criterios de la barra de filtros del boceto 04, con la lógica de cada
 * uno al lado del criterio.
 *
 * El filtrado es en memoria: el servicio trae los equipos y los pasa por este
 * predicado. Es lo correcto mientras el inventario sea de cientos de filas,
 * que es el caso de un colegio. Si algún día son decenas de miles, esto hay
 * que mover a la base con Specifications; el resto del módulo no cambiaría.
 */
public record FiltroEquipos(
        String busqueda,
        Integer tipo,
        Integer marca,
        Integer ubicacion,
        Integer estado,
        Relacion relacion) {

    /** Las tres pestañas «Todos / Principales / Componentes» del boceto. */
    public enum Relacion {
        TODOS, PRINCIPALES, COMPONENTES;

        public static Relacion desde(String texto) {
            if (texto == null || texto.isBlank()) {
                return TODOS;
            }
            return switch (texto.toLowerCase(Locale.ROOT)) {
                case "principales" -> PRINCIPALES;
                case "componentes" -> COMPONENTES;
                default -> TODOS;
            };
        }
    }

    /** Normaliza: un filtro en blanco es lo mismo que no filtrar. */
    public FiltroEquipos {
        busqueda = (busqueda == null || busqueda.isBlank())
                ? null
                : busqueda.trim().toLowerCase(Locale.ROOT);
        relacion = relacion == null ? Relacion.TODOS : relacion;
    }

    /** El predicado completo: solo se aplica lo que venga informado. */
    public Predicate<Equipo> comoPredicado() {
        return porTexto()
                .and(porTipo())
                .and(porMarca())
                .and(porUbicacion())
                .and(porEstado())
                .and(porRelacion());
    }

    /**
     * Busca en nombre, código, serial y modelo, que es lo que anuncia el
     * campo del boceto.
     */
    private Predicate<Equipo> porTexto() {
        if (busqueda == null) {
            return e -> true;
        }
        return e -> contiene(e.getNombreElemento())
                 || contiene(e.getCodElemento())
                 || contiene(e.getSerial())
                 || contiene(e.getModelo());
    }

    private boolean contiene(String valor) {
        return valor != null && valor.toLowerCase(Locale.ROOT).contains(busqueda);
    }

    private Predicate<Equipo> porTipo() {
        return tipo == null ? e -> true
                : e -> tipo.equals(e.getTipo().getCodTipoElemento());
    }

    /** La marca es opcional en un equipo, así que hay que mirar el nulo. */
    private Predicate<Equipo> porMarca() {
        return marca == null ? e -> true
                : e -> e.getMarca() != null && marca.equals(e.getMarca().getCodMarca());
    }

    private Predicate<Equipo> porUbicacion() {
        return ubicacion == null ? e -> true
                : e -> ubicacion.equals(e.getUbicacion().getCodUbiElemento());
    }

    private Predicate<Equipo> porEstado() {
        return estado == null ? e -> true
                : e -> estado.equals(e.getEstado().getCodEstadoElemento());
    }

    private Predicate<Equipo> porRelacion() {
        return switch (relacion) {
            case PRINCIPALES -> e -> !e.esComponente();
            case COMPONENTES -> Equipo::esComponente;
            case TODOS -> e -> true;
        };
    }
}
