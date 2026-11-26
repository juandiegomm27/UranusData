package com.uranusdata.inventario.equipos.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.uranusdata.inventario.equipos.domain.Equipo;
import java.util.List;

/**
 * Lo que sale en el JSON de un equipo.
 *
 * La forma no es libre: la plantilla de Angular ya lee estos nombres exactos
 * (lista-inventario.html), así que el contrato manda sobre el gusto personal.
 * De ahí tres decisiones que de otro modo serían raras:
 *
 *   - los catálogos salen como código suelto (cod_tipo_elemento), porque el
 *     frontend resuelve el nombre contra las listas de /inventario/opciones;
 *   - la marca sí sale como objeto, porque la plantilla pinta elemento.marca.marca;
 *   - el número de componentes se llama hijos_count, no totalComponentes.
 */
@JsonInclude(JsonInclude.Include.ALWAYS)
public record EquipoResponse(
        @JsonProperty("id_elemento") Integer idElemento,
        @JsonProperty("cod_elemento") String codElemento,
        @JsonProperty("nombre_elemento") String nombreElemento,
        String serial,
        String modelo,
        String descripcion,

        /** Objeto, porque la plantilla hace elemento.marca?.marca. Puede ser null. */
        MarcaResumen marca,

        @JsonProperty("cod_tipo_elemento") Integer codTipoElemento,
        @JsonProperty("cod_marca") Integer codMarca,
        @JsonProperty("cod_estado_elemento") Integer codEstadoElemento,
        @JsonProperty("cod_ubi_elemento") Integer codUbiElemento,

        /** El principal del que cuelga este equipo, o null si es principal. */
        PadreResumen padre,

        /** Cuántos componentes tiene. La plantilla lo pinta tal cual. */
        @JsonProperty("hijos_count") int hijosCount,

        /** Solo se llena en el detalle; en el listado va vacía. */
        List<EquipoResponse> componentes) {

    public record MarcaResumen(@JsonProperty("cod_marca") Integer codMarca, String marca) {
    }

    public record PadreResumen(@JsonProperty("id_elemento") Integer idElemento,
                               @JsonProperty("cod_elemento") String codElemento) {
    }

    /** Fila del listado: sin componentes dentro, solo cuántos son. */
    public static EquipoResponse resumen(Equipo e, int hijosCount) {
        return construir(e, hijosCount, List.of());
    }

    /** Detalle: con sus componentes dentro. */
    public static EquipoResponse detalle(Equipo e, List<EquipoResponse> componentes) {
        return construir(e, componentes.size(), componentes);
    }

    private static EquipoResponse construir(Equipo e, int hijos, List<EquipoResponse> componentes) {
        Equipo padre = e.getPadre();

        return new EquipoResponse(
                e.getIdElemento(),
                e.getCodElemento(),
                e.getNombreElemento(),
                e.getSerial(),
                e.getModelo(),
                e.getDescripcion(),
                e.getMarca() == null ? null
                        : new MarcaResumen(e.getMarca().getCodMarca(), e.getMarca().getMarca()),
                e.getTipo().getCodTipoElemento(),
                e.getMarca() == null ? null : e.getMarca().getCodMarca(),
                e.getEstado().getCodEstadoElemento(),
                e.getUbicacion().getCodUbiElemento(),
                padre == null ? null
                        : new PadreResumen(padre.getIdElemento(), padre.getCodElemento()),
                hijos,
                componentes);
    }
}
