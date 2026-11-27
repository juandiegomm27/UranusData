package com.uranusdata.inventario.accesorios.repository;

import com.uranusdata.inventario.accesorios.domain.Accesorio;
import com.uranusdata.inventario.accesorios.domain.StockAccesorio;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Consultas y escrituras de las tablas inventario_accesorios y
 * stock_accesorios.
 */
@Repository
public class AccesorioRepository {
    private final JdbcTemplate jdbc;

    public AccesorioRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public long contar(String busqueda, Integer tipo, Integer marca, Integer ubicacion) {
        Object[] filtros = filtros(busqueda, tipo, marca, ubicacion);
        Long total = jdbc.queryForObject("SELECT count(*) FROM inventario_accesorios a" + where(), Long.class, filtros);
        return total == null ? 0 : total;
    }

    public List<Map<String, Object>> listar(String busqueda, Integer tipo, Integer marca,
            Integer ubicacion, int pagina, int porPagina) {
        Object[] filtros = filtros(busqueda, tipo, marca, ubicacion);
        Object[] args = Arrays.copyOf(filtros, filtros.length + 2);
        args[filtros.length] = porPagina;
        args[filtros.length + 1] = (pagina - 1) * porPagina;

        List<Map<String, Object>> filas = jdbc.queryForList("""
                SELECT a.*, t.tipo AS tipo_nombre, m.marca AS marca_nombre
                FROM inventario_accesorios a
                LEFT JOIN tipo_elemento t USING(cod_tipo_elemento)
                LEFT JOIN marca m USING(cod_marca)
                """ + where() + " ORDER BY a.nombre LIMIT ? OFFSET ?", args);

        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Map<String, Object> fila : filas) {
            Integer id = ((Number) fila.get("id_accesorio")).intValue();
            List<Map<String, Object>> stocks = jdbc.queryForList("""
                    SELECT s.id_stock, s.id_accesorio, s.cod_ubi_elemento,
                           s.cantidad_total, s.cantidad_disponible,
                           u.cod_ubi_elemento AS ubicacion_cod, u.ubicacion AS ubicacion_nombre
                    FROM stock_accesorios s JOIN ubi_elemento u USING(cod_ubi_elemento)
                    WHERE s.id_accesorio=? AND (CAST(? AS INTEGER) IS NULL OR s.cod_ubi_elemento=?)
                    ORDER BY u.ubicacion
                    """, id, ubicacion, ubicacion);
            for (Map<String, Object> stock : stocks) {
                Map<String, Object> ubicacionMap = new LinkedHashMap<>();
                ubicacionMap.put("cod_ubi_elemento", stock.remove("ubicacion_cod"));
                ubicacionMap.put("ubicacion", stock.remove("ubicacion_nombre"));
                stock.put("ubicacion", ubicacionMap);
            }
            Map<String, Object> item = new LinkedHashMap<>(fila);
            Object tipoNombre = item.remove("tipo_nombre");
            Object marcaNombre = item.remove("marca_nombre");
            item.put("tipo", tipoNombre == null ? null : Map.of("tipo", tipoNombre));
            item.put("marca", marcaNombre == null ? null : Map.of("marca", marcaNombre));
            item.put("stocks", stocks);
            resultado.add(item);
        }
        return resultado;
    }

    public Integer crear(Accesorio accesorio) {
        return jdbc.queryForObject("""
                INSERT INTO inventario_accesorios
                    (nombre,modelo,descripcion,cod_tipo_elemento,cod_marca,cantidad_total,cantidad_disponible)
                VALUES (?,?,?,?,?,?,?) RETURNING id_accesorio
                """, Integer.class, accesorio.nombre(), accesorio.modelo(), accesorio.descripcion(),
                accesorio.codTipoElemento(), accesorio.codMarca(), accesorio.cantidadTotal(),
                accesorio.cantidadDisponible());
    }

    public boolean existeNombre(String nombre, Integer excluirId) {
        Boolean existe = jdbc.queryForObject("""
                SELECT EXISTS(SELECT 1 FROM inventario_accesorios
                WHERE lower(btrim(nombre))=lower(btrim(?)) AND (CAST(? AS INTEGER) IS NULL OR id_accesorio<>?))
                """, Boolean.class, nombre, excluirId, excluirId);
        return Boolean.TRUE.equals(existe);
    }

    public boolean existe(Integer id) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM inventario_accesorios WHERE id_accesorio=?)", Boolean.class, id));
    }

    public void sumarExistencias(Integer id, Integer cantidad) {
        jdbc.update(
                "UPDATE inventario_accesorios SET cantidad_total=cantidad_total+?,cantidad_disponible=cantidad_disponible+? WHERE id_accesorio=?",
                cantidad, cantidad, id);
    }

    public void guardarStock(Integer idAccesorio, Integer ubicacion, Integer cantidad) {
        jdbc.update("""
                INSERT INTO stock_accesorios(id_accesorio,cod_ubi_elemento,cantidad_total,cantidad_disponible)
                VALUES(?,?,?,?) ON CONFLICT(id_accesorio,cod_ubi_elemento) DO UPDATE
                SET cantidad_total=stock_accesorios.cantidad_total+EXCLUDED.cantidad_total,
                    cantidad_disponible=stock_accesorios.cantidad_disponible+EXCLUDED.cantidad_disponible
                """, idAccesorio, ubicacion, cantidad, cantidad);
    }

    public int actualizar(Accesorio accesorio) {
        return jdbc.update("""
                UPDATE inventario_accesorios SET nombre=?,modelo=?,descripcion=?,cod_tipo_elemento=?,cod_marca=?
                WHERE id_accesorio=?
                """, accesorio.nombre(), accesorio.modelo(), accesorio.descripcion(),
                accesorio.codTipoElemento(), accesorio.codMarca(), accesorio.idAccesorio());
    }

    public StockAccesorio bloquearStock(Integer idStock) {
        List<StockAccesorio> filas = jdbc.query("SELECT * FROM stock_accesorios WHERE id_stock=? FOR UPDATE",
                (rs, row) -> new StockAccesorio(rs.getInt("id_stock"), rs.getInt("id_accesorio"),
                        rs.getInt("cod_ubi_elemento"), rs.getInt("cantidad_total"), rs.getInt("cantidad_disponible")),
                idStock);
        return filas.isEmpty() ? null : filas.get(0);
    }

    public void descontarStock(Integer idStock, Integer cantidad) {
        jdbc.update(
                "UPDATE stock_accesorios SET cantidad_total=cantidad_total-?,cantidad_disponible=cantidad_disponible-? WHERE id_stock=?",
                cantidad, cantidad, idStock);
    }

    public void registrarBaja(Integer idStock, Integer idAccesorio, String nombre,
            String modelo, String descripcion, Integer tipo,
            Integer ubicacion, String nombreUbicacion,
            Integer cantidad, String motivo) {
        jdbc.update("""
                INSERT INTO historial_bajas_general
                    (tipo_item,id_original,id_accesorio,nombre,codigo_identificacion,modelo,
                     descripcion,cantidad,cod_tipo_elemento,cod_ubi_elemento,ubicacion,motivo)
                VALUES ('accesorio',?,?,?,?,?,?,?,?,?,?,?)
                """, idStock, idAccesorio, nombre, "STOCK-" + idStock, modelo,
                descripcion, cantidad, tipo, ubicacion, nombreUbicacion,
                motivo == null || motivo.isBlank() ? "Baja de unidades de accesorio" : motivo.trim());
        jdbc.update(
                "UPDATE stock_accesorios SET cantidad_total=cantidad_total-?,cantidad_disponible=cantidad_disponible-? WHERE id_stock=?",
                cantidad, cantidad, idStock);
        jdbc.update(
                "UPDATE inventario_accesorios SET cantidad_total=cantidad_total-?,cantidad_disponible=cantidad_disponible-? WHERE id_accesorio=?",
                cantidad, cantidad, idAccesorio);
    }

    public Accesorio buscarPorId(Integer id) {
        List<Accesorio> filas = jdbc.query("SELECT * FROM inventario_accesorios WHERE id_accesorio=?",
                (rs, row) -> new Accesorio(rs.getInt("id_accesorio"), rs.getString("nombre"),
                        rs.getString("modelo"), rs.getString("descripcion"),
                        (Integer) rs.getObject("cod_tipo_elemento"), (Integer) rs.getObject("cod_marca"),
                        rs.getInt("cantidad_total"), rs.getInt("cantidad_disponible")),
                id);
        return filas.isEmpty() ? null : filas.get(0);
    }

    public String nombreUbicacion(Integer id) {
        return jdbc.query("SELECT ubicacion FROM ubi_elemento WHERE cod_ubi_elemento=?",
                rs -> rs.next() ? rs.getString(1) : null, id);
    }

    public boolean existeUbicacion(Integer id) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM ubi_elemento WHERE cod_ubi_elemento=?)", Boolean.class, id));
    }

    public boolean existeTipo(Integer id) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM tipo_elemento WHERE cod_tipo_elemento=?)", Boolean.class, id));
    }

    public boolean existeMarca(Integer id) {
        return Boolean.TRUE
                .equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM marca WHERE cod_marca=?)", Boolean.class, id));
    }

    private static String where() {
        return " WHERE (CAST(? AS INTEGER) IS NULL OR a.cod_tipo_elemento=?)"
                + " AND (CAST(? AS INTEGER) IS NULL OR a.cod_marca=?)"
                + " AND (CAST(? AS INTEGER) IS NULL OR EXISTS(SELECT 1 FROM stock_accesorios sx"
                + " WHERE sx.id_accesorio=a.id_accesorio AND sx.cod_ubi_elemento=?))"
                + " AND (?='' OR a.nombre ILIKE ? OR COALESCE(a.modelo,'') ILIKE ?"
                + " OR COALESCE(a.descripcion,'') ILIKE ? OR EXISTS(SELECT 1 FROM marca mx"
                + " WHERE mx.cod_marca=a.cod_marca AND mx.marca ILIKE ?))";
    }

    private static Object[] filtros(String busqueda, Integer tipo, Integer marca, Integer ubicacion) {
        String texto = busqueda == null ? "" : busqueda.trim();
        String patron = "%" + texto + "%";
        return new Object[] { tipo, tipo, marca, marca, ubicacion, ubicacion, texto, patron, patron, patron, patron };
    }
}
