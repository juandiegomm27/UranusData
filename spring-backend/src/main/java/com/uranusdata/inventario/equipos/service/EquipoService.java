package com.uranusdata.inventario.equipos.service;

import com.uranusdata.inventario.equipos.domain.Equipo;
import com.uranusdata.inventario.equipos.domain.EstadoElemento;
import com.uranusdata.inventario.equipos.domain.Marca;
import com.uranusdata.inventario.equipos.domain.TipoElemento;
import com.uranusdata.inventario.equipos.domain.UbiElemento;
import com.uranusdata.inventario.equipos.dto.CrearEquipoRequest;
import com.uranusdata.inventario.equipos.dto.EquipoResponse;
import com.uranusdata.inventario.equipos.dto.FiltroEquipos;
import com.uranusdata.inventario.equipos.dto.OpcionesResponse;
import com.uranusdata.inventario.equipos.repository.EquipoRepository;
import com.uranusdata.inventario.equipos.repository.EstadoElementoRepository;
import com.uranusdata.inventario.equipos.repository.MarcaRepository;
import com.uranusdata.inventario.equipos.repository.TipoElementoRepository;
import com.uranusdata.inventario.equipos.repository.UbiElementoRepository;
import com.uranusdata.shared.web.ApiException;
import org.springframework.jdbc.core.JdbcTemplate;
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
 * Operaciones de activos fijos del inventario.
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
    private final JdbcTemplate jdbc;

    public EquipoService(EquipoRepository equipos,
                         TipoElementoRepository tipos,
                         MarcaRepository marcas,
                         EstadoElementoRepository estados,
                         UbiElementoRepository ubicaciones,
                         JdbcTemplate jdbc) {
        this.equipos = equipos;
        this.tipos = tipos;
        this.marcas = marcas;
        this.estados = estados;
        this.ubicaciones = ubicaciones;
        this.jdbc = jdbc;
    }

    /** Crea un activo fijo y registra el alta en el historial de movimientos. */
    @Transactional
    public EquipoResponse crear(CrearEquipoRequest datos, String documento) {
        validarUnicos(datos.codElemento(), datos.serial(), null);
        TipoElemento tipo = tipos.findById(datos.codTipoElemento())
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El tipo seleccionado no existe"));
        UbiElemento ubicacion = ubicaciones.findById(datos.codUbiElemento())
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La ubicación seleccionada no existe"));
        Marca marca = datos.codMarca() == null ? null : marcas.findById(datos.codMarca())
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La marca seleccionada no existe"));
        Equipo padre = buscarPadreValido(datos.idElementoPadre(), null);
        EstadoElemento activo = estados.findById(Equipo.ACTIVO)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "No existe el estado Activo"));

        Equipo equipo = equipos.save(new Equipo(
                datos.codElemento(), datos.nombreElemento(), datos.serial(), datos.modelo(),
                datos.descripcion(), tipo, marca, activo, ubicacion));
        if (padre != null) {
            equipo.vincularA(padre);
        }
        if (equipo.getCodElemento() == null || equipo.getCodElemento().isBlank()) {
            equipo.cambiarDatos(generarCodigo(equipo), equipo.getNombreElemento(), equipo.getSerial(),
                    equipo.getModelo(), equipo.getDescripcion());
            equipo = equipos.save(equipo);
        }
        registrarMovimiento(equipo.getIdElemento(), "alta", "Equipo creado", documento, null);
        return detallePorId(equipo.getIdElemento());
    }

    /** Actualiza datos del activo, sin permitir cambios directos de estado. */
    @Transactional
    public EquipoResponse actualizar(Integer id, CrearEquipoRequest datos, String documento) {
        Equipo equipo = equipos.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipo no encontrado"));
        validarUnicos(datos.codElemento(), datos.serial(), id);

        TipoElemento tipo = tipos.findById(datos.codTipoElemento())
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El tipo seleccionado no existe"));
        UbiElemento ubicacion = ubicaciones.findById(datos.codUbiElemento())
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La ubicación seleccionada no existe"));
        Marca marca = datos.codMarca() == null ? null : marcas.findById(datos.codMarca())
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La marca seleccionada no existe"));
        Equipo padre = buscarPadreValido(datos.idElementoPadre(), equipo);

        String codigo = datos.codElemento();
        if ((codigo == null || codigo.isBlank()) && equipo.getCodElemento() != null) {
            codigo = equipo.getCodElemento();
        }
        equipo.cambiarDatos(codigo, datos.nombreElemento(), datos.serial(), datos.modelo(), datos.descripcion());
        equipo.cambiarClasificacion(tipo, marca, equipo.getEstado(), ubicacion, padre);
        equipo = equipos.save(equipo);
        registrarMovimiento(equipo.getIdElemento(), "edicion", "Datos del equipo actualizados", documento, null);
        return detallePorId(equipo.getIdElemento());
    }

    /** Registra la baja lógica del activo y conserva su instantánea restaurable. */
    @Transactional
    public void darDeBaja(Integer id, String motivo, String documento) {
        Equipo equipo = equipos.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Activo no encontrado."));
        int estado = equipo.getEstado().getCodEstadoElemento();
        if (estado == Equipo.BAJA) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Este activo ya se encuentra dado de baja.");
        }
        if (estado == Equipo.EN_PRESTAMO) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "No puedes dar de baja un activo que está en préstamo. Registra primero su devolución.");
        }
        if (estado == Equipo.MANTENIMIENTO) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Este equipo está en mantenimiento. Finaliza el mantenimiento antes de darlo de baja.");
        }

        Integer reservaPendiente = jdbc.query("""
                SELECT r.id_reserva
                FROM reserva r
                JOIN reserva_detalles rd ON rd.id_reserva = r.id_reserva
                LEFT JOIN prestamo p ON p.id_reserva = r.id_reserva
                WHERE rd.id_elemento = ? AND r.num_estado = 1
                  AND (p.id_reserva IS NULL OR p.cod_estado_prestamo = 1)
                ORDER BY r.id_reserva
                LIMIT 1
                """, rs -> rs.next() ? rs.getInt(1) : null, id);
        if (reservaPendiente != null) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Este equipo tiene la reserva #" + reservaPendiente + " pendiente de entrega. Entrégala o pide al docente que la cancele antes de darlo de baja.");
        }

        String motivoFinal = motivo == null || motivo.isBlank() ? "Baja de activo fijo" : motivo.trim();
        jdbc.update("""
                INSERT INTO historial_bajas_general
                    (tipo_item, id_original, nombre, codigo_identificacion, modelo, descripcion,
                     cantidad, cod_tipo_elemento, cod_ubi_elemento, ubicacion, motivo)
                VALUES ('activo', ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
                """, id, equipo.getNombreElemento(),
                equipo.getCodElemento() == null ? "EQ-" + id : equipo.getCodElemento(),
                equipo.getModelo(), equipo.getDescripcion(), equipo.getTipo().getCodTipoElemento(),
                equipo.getUbicacion().getCodUbiElemento(), equipo.getUbicacion().getUbicacion(), motivoFinal);

        EstadoElemento baja = estados.findById(Equipo.BAJA)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "No existe el estado Baja"));
        equipo.cambiarEstado(baja);
        equipos.save(equipo);

        // El modelo solo permite un nivel; al retirar el principal los componentes quedan independientes.
        List<Equipo> componentes = equipos.findByPadreIdElementoOrderByCodElementoAsc(id);
        for (Equipo componente : componentes) {
            componente.desvincular();
            registrarMovimiento(componente.getIdElemento(), "desvinculo",
                    "Componente separado por la baja de su elemento principal", documento, motivoFinal);
        }
        equipos.saveAll(componentes);
        registrarMovimiento(id, "baja", "Activo fijo dado de baja", documento, motivoFinal);
    }

    @Transactional
    public Map<String, Object> enviarMantenimiento(Integer id, Integer tipoMantenimiento, String descripcion, String documento) {
        Equipo equipo = equipos.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipo no encontrado"));
        if (!equipo.estaActivo()) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Solo los equipos activos pueden enviarse a mantenimiento.");
        Integer reserva = jdbc.query("""
                SELECT r.id_reserva FROM reserva r JOIN reserva_detalles rd ON rd.id_reserva=r.id_reserva
                LEFT JOIN prestamo p ON p.id_reserva=r.id_reserva
                WHERE rd.id_elemento=? AND r.num_estado=1 AND (p.id_reserva IS NULL OR p.cod_estado_prestamo=1)
                ORDER BY r.id_reserva LIMIT 1
                """, rs -> rs.next() ? rs.getInt(1) : null, id);
        if (reserva != null) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El equipo tiene la reserva #" + reserva + " pendiente de entrega.");
        Integer tipoOk = jdbc.query("SELECT cod_tipo_mantenimiento FROM tipo_mantenimiento WHERE cod_tipo_mantenimiento=?", rs -> rs.next() ? rs.getInt(1) : null, tipoMantenimiento);
        if (tipoOk == null) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El tipo de mantenimiento no existe.");
        Map<String,Object> mant = jdbc.queryForMap("""
                INSERT INTO mantenimiento(fecha,cod_tipo_mantenimiento,documento,id_elemento,elemento,serial,descripcion,cod_estado_mantenimiento)
                VALUES (CURRENT_DATE,?,?,?,?,?,?,1) RETURNING id_mantenimiento,fecha,cod_tipo_mantenimiento,id_elemento,descripcion,cod_estado_mantenimiento
                """, tipoMantenimiento, documento, id, equipo.getNombreElemento(), equipo.getSerial(), descripcion);
        EstadoElemento estado = estados.findById(Equipo.MANTENIMIENTO).orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "No existe el estado Mantenimiento"));
        equipo.cambiarEstado(estado);
        registrarMovimiento(id,"mantenimiento","Equipo enviado a mantenimiento",documento,descripcion);
        return mant;
    }

    @Transactional(readOnly = true)
    public List<Map<String,Object>> historialMantenimiento(Integer id) {
        if (!equipos.existsById(id)) throw new ApiException(HttpStatus.NOT_FOUND,"Equipo no encontrado");
        return jdbc.queryForList("""
            SELECT m.*, tm.tipo AS tipo_mantenimiento, em.estado AS estado_mantenimiento
            FROM mantenimiento m JOIN tipo_mantenimiento tm USING(cod_tipo_mantenimiento)
            JOIN estado_mantenimiento em USING(cod_estado_mantenimiento)
            WHERE id_elemento=? ORDER BY fecha DESC,id_mantenimiento DESC
            """, id);
    }

    @Transactional(readOnly = true)
    public Map<String,Object> movimientos(Integer id, Integer page, Integer perPage) {
        if (!equipos.existsById(id)) throw new ApiException(HttpStatus.NOT_FOUND,"Equipo no encontrado");
        int tam = perPage == null || perPage < 1 ? 10 : Math.min(perPage,100);
        int pag = page == null || page < 1 ? 1 : page;
        long total = jdbc.queryForObject("SELECT count(*) FROM inventario_movimientos WHERE id_elemento=?", Long.class,id);
        List<Map<String,Object>> filas = jdbc.queryForList("SELECT * FROM inventario_movimientos WHERE id_elemento=? ORDER BY fecha DESC,id_movimiento DESC LIMIT ? OFFSET ?",id,tam,(pag-1)*tam);
        return Map.of("data",filas,"total",total,"current_page",pag,"per_page",tam,"last_page",Math.max(1,(int)Math.ceil((double)total/tam)));
    }

    private void validarUnicos(String codigo, String serial, Integer id) {
        if (codigo != null && !codigo.isBlank()
                && (id == null ? equipos.existsByCodElementoIgnoreCase(codigo)
                               : equipos.existsByCodElementoIgnoreCaseAndIdElementoNot(codigo, id))) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Ya existe un elemento con ese código.");
        }
        if (serial != null && !serial.isBlank()
                && (id == null ? equipos.existsBySerialIgnoreCase(serial)
                               : equipos.existsBySerialIgnoreCaseAndIdElementoNot(serial, id))) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Ya existe un elemento con ese serial.");
        }
    }

    private Equipo buscarPadreValido(Integer idPadre, Equipo actual) {
        if (idPadre == null) {
            return null;
        }
        Equipo padre = equipos.findById(idPadre)
                .orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El elemento principal seleccionado no existe."));
        if (actual != null && actual.getIdElemento().equals(idPadre)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Un elemento no puede pertenecer a sí mismo.");
        }
        if (padre.getEstado().getCodEstadoElemento() == Equipo.BAJA) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El elemento principal está dado de baja.");
        }
        if (padre.esComponente()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El elemento principal ya es componente de otro. Solo se permite un nivel.");
        }
        if (actual != null && !actual.esComponente()
                && !equipos.findByPadreIdElementoOrderByCodElementoAsc(actual.getIdElemento()).isEmpty()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Este elemento tiene componentes y no puede ser un componente de otro.");
        }
        return padre;
    }

    private String generarCodigo(Equipo equipo) {
        String limpio = equipo.getNombreElemento().replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        String prefijo = limpio.isEmpty() ? "EQ" : limpio.substring(0, Math.min(3, limpio.length()));
        String base = prefijo + "-" + String.format("%03d", equipo.getIdElemento());
        String candidato = base;
        int sufijo = 1;
        while (equipos.existsByCodElementoIgnoreCase(candidato)) {
            candidato = base + "-" + sufijo++;
        }
        return candidato;
    }

    private void registrarMovimiento(Integer id, String tipo, String descripcion,
                                     String documento, String motivo) {
        jdbc.update("INSERT INTO inventario_movimientos (id_elemento, tipo, descripcion, datos, documento, usuario) "
                        + "VALUES (?, ?, ?, jsonb_build_object('motivo', CAST(? AS TEXT)), ?, ?)",
                id, tipo, descripcion, motivo, documento, documento);
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
                        .toList(),
                jdbc.query("SELECT cod_tipo_mantenimiento,tipo FROM tipo_mantenimiento ORDER BY tipo",
                        (rs,n) -> Map.of("cod_tipo_mantenimiento",rs.getInt(1),"tipo_mantenimiento",rs.getString(2))));
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
