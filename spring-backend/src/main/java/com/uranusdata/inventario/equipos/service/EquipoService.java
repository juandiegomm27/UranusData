package com.uranusdata.inventario.equipos.service;

import com.uranusdata.inventario.equipos.domain.Equipo;
import com.uranusdata.inventario.equipos.dto.EquipoResponse;
import com.uranusdata.inventario.equipos.dto.FiltroEquipos;
import com.uranusdata.inventario.equipos.dto.OpcionesResponse;
import com.uranusdata.inventario.equipos.repository.EquipoRepository;
import com.uranusdata.inventario.equipos.repository.EstadoElementoRepository;
import com.uranusdata.inventario.equipos.repository.MarcaRepository;
import com.uranusdata.inventario.equipos.repository.TipoElementoRepository;
import com.uranusdata.inventario.equipos.repository.UbiElementoRepository;
import com.uranusdata.shared.web.ApiException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Listado de equipos: búsqueda, filtros y la relación principal–componentes.
 *
 * Esta primera entrega es solo de lectura. Registrar, editar, vincular, enviar
 * a mantenimiento y dar de baja vienen después; el dominio ya tiene los
 * métodos (vincularA, desvincular, cambiarEstado) esperándolos.
 */
@Service
public class EquipoService {

    private static final int POR_PAGINA_POR_DEFECTO = 15;
    private static final int MAXIMO_POR_PAGINA = 100;

    private final EquipoRepository equipos;
    private final TipoElementoRepository tipos;
    private final MarcaRepository marcas;
    private final EstadoElementoRepository estados;
    private final UbiElementoRepository ubicaciones;

    public EquipoService(EquipoRepository equipos,
                         TipoElementoRepository tipos,
                         MarcaRepository marcas,
                         EstadoElementoRepository estados,
                         UbiElementoRepository ubicaciones) {
        this.equipos = equipos;
        this.tipos = tipos;
        this.marcas = marcas;
        this.estados = estados;
        this.ubicaciones = ubicaciones;
    }

    /** Los cuatro catálogos de los desplegables, en una sola respuesta. */
    @Transactional(readOnly = true)
    public OpcionesResponse opciones() {
        return new OpcionesResponse(
                tipos.findAllByOrderByTipoAsc().stream()
                        .map(t -> new OpcionesResponse.Tipo(t.getCodTipoElemento(), t.getTipo()))
                        .toList(),
                marcas.findAllByOrderByMarcaAsc().stream()
                        .map(m -> new OpcionesResponse.Marca(m.getCodMarca(), m.getMarca()))
                        .toList(),
                estados.findAllByOrderByEstadoAsc().stream()
                        .map(e -> new OpcionesResponse.Estado(e.getCodEstadoElemento(), e.getEstado()))
                        .toList(),
                ubicaciones.findAllByOrderByUbicacionAsc().stream()
                        .map(u -> new OpcionesResponse.Ubicacion(u.getCodUbiElemento(), u.getUbicacion()))
                        .toList());
    }

    /**
     * El listado del boceto 04.
     *
     * Trae los equipos una sola vez, los filtra en memoria y pagina el
     * resultado. Hacerlo así tiene una ventaja concreta: el conteo de
     * componentes de cada fila sale del mismo listado, sin una consulta por
     * equipo. El precio es traer la tabla entera, asumible con el inventario
     * de un colegio.
     */
    @Transactional(readOnly = true)
    public Page<EquipoResponse> listar(FiltroEquipos filtro, Integer pagina, Integer porPagina) {
        List<Equipo> todos = equipos.findAllByOrderByCodElementoAsc();

        // Cuántos componentes tiene cada equipo, contados de una pasada.
        Map<Integer, Integer> componentesPorPadre = contarComponentes(todos);

        List<EquipoResponse> filtrados = todos.stream()
                .filter(filtro.comoPredicado())
                .map(e -> EquipoResponse.resumen(
                        e, componentesPorPadre.getOrDefault(e.getIdElemento(), 0)))
                .toList();

        return paginar(filtrados, pagina, porPagina);
    }

    /**
     * El detalle por id, que es como lo pide el frontend: la tabla guarda
     * id_elemento en cada fila y navega con ese número.
     */
    @Transactional(readOnly = true)
    public EquipoResponse detallePorId(Integer idElemento) {
        Equipo equipo = equipos.findById(idElemento)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipo no encontrado"));
        return conComponentes(equipo);
    }

    /** El mismo detalle, buscando por el código visible (PORT-001). */
    @Transactional(readOnly = true)
    public EquipoResponse detallePorCodigo(String codElemento) {
        Equipo equipo = equipos.findByCodElementoIgnoreCase(codElemento)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipo no encontrado"));
        return conComponentes(equipo);
    }

    private EquipoResponse conComponentes(Equipo equipo) {
        List<EquipoResponse> componentes =
                equipos.findByPadreIdElementoOrderByCodElementoAsc(equipo.getIdElemento()).stream()
                        .map(c -> EquipoResponse.resumen(c, 0))
                        .toList();

        return EquipoResponse.detalle(equipo, componentes);
    }

    /**
     * Los equipos que pueden pasar a ser componentes de otro, para el modal
     * de vincular del boceto 09.
     *
     * Quedan fuera tres casos, y cada uno por una razón distinta:
     *   - el propio equipo, que no puede ser componente de sí mismo;
     *   - los que ya son componentes de alguien, para no robárselos;
     *   - los que tienen componentes propios, porque la jerarquía es de un
     *     solo nivel y encadenarlos dejaría nietos sin dueño al dar de baja.
     */
    @Transactional(readOnly = true)
    public List<EquipoResponse> candidatosAComponente(Integer idElemento) {
        Equipo principal = equipos.findById(idElemento)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipo no encontrado"));

        List<Equipo> todos = equipos.findAllByOrderByCodElementoAsc();
        Map<Integer, Integer> componentesPorPadre = contarComponentes(todos);

        return todos.stream()
                .filter(e -> !e.getIdElemento().equals(principal.getIdElemento()))
                .filter(e -> !e.esComponente())
                .filter(e -> componentesPorPadre.getOrDefault(e.getIdElemento(), 0) == 0)
                .map(e -> EquipoResponse.resumen(e, 0))
                .toList();
    }

    // ------------------------------------------------------------
    // Apoyo
    // ------------------------------------------------------------

    /** id del padre -> cuántos componentes cuelgan de él. */
    private static Map<Integer, Integer> contarComponentes(List<Equipo> todos) {
        Map<Integer, Integer> cuenta = new LinkedHashMap<>();
        for (Equipo e : todos) {
            if (e.esComponente()) {
                cuenta.merge(e.getPadre().getIdElemento(), 1, Integer::sum);
            }
        }
        return cuenta;
    }

    /** Corta la lista ya filtrada en la página pedida. */
    private static Page<EquipoResponse> paginar(List<EquipoResponse> filas,
                                                Integer pagina, Integer porPagina) {
        int tamano = (porPagina == null || porPagina < 1)
                ? POR_PAGINA_POR_DEFECTO
                : Math.min(porPagina, MAXIMO_POR_PAGINA);
        int indice = (pagina == null || pagina < 1) ? 0 : pagina - 1;

        Pageable peticion = PageRequest.of(indice, tamano);

        int desde = indice * tamano;
        if (desde >= filas.size()) {
            // Página más allá del final: se devuelve vacía, no un error.
            return new PageImpl<>(new ArrayList<>(), peticion, filas.size());
        }
        int hasta = Math.min(desde + tamano, filas.size());

        return new PageImpl<>(filas.subList(desde, hasta), peticion, filas.size());
    }
}
