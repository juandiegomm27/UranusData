package com.uranusdata.inventario.exportacion.service;

import com.uranusdata.inventario.accesorios.repository.AccesorioRepository;
import com.uranusdata.inventario.equipos.domain.Equipo;
import com.uranusdata.inventario.equipos.dto.FiltroEquipos;
import com.uranusdata.inventario.equipos.service.EquipoService;
import com.uranusdata.shared.web.ApiException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Genera el .xlsx del inventario con Apache POI.
 *
 * Dos decisiones que conviene tener claras para defenderlas:
 *
 *   1. Exporta lo que el usuario está viendo. Recibe los mismos filtros que
 *      la tabla y los aplica con el mismo código, así que el archivo nunca
 *      dice una cosa distinta de la pantalla. Lo que no lleva es la
 *      paginación: el Excel sale completo, no solo la página en curso.
 *
 *   2. En accesorios, cada fila es un lote (accesorio + ubicación), no un
 *      accesorio. Es la unidad real del módulo: 30 ganchos en Almacén y 20
 *      en Sala 1 son dos existencias distintas, y juntarlas en una fila
 *      escondería justo el dato que se quiere revisar.
 *
 * El archivo se arma entero en memoria y se devuelve como byte[]. Con el
 * inventario de un colegio (cientos de filas) son unos pocos cientos de KB;
 * si algún día fueran decenas de miles habría que pasar a SXSSFWorkbook, que
 * escribe en disco por bloques.
 */
@Service
public class ExcelInventarioService {

    /** Tope de seguridad: un Excel no debe poder tumbar la aplicación. */
    private static final int MAX_FILAS = 50_000;

    private static final String[] COLUMNAS_EQUIPOS = {
        "Código", "Nombre", "Serial", "Modelo", "Tipo", "Marca",
        "Estado", "Ubicación", "Pertenece a", "N.º componentes", "Descripción"
    };

    private static final String[] COLUMNAS_ACCESORIOS = {
        "Accesorio", "Modelo", "Tipo", "Marca", "Ubicación",
        "Cantidad total", "Disponible", "En uso", "Descripción"
    };

    private final EquipoService equipos;
    private final AccesorioRepository accesorios;

    public ExcelInventarioService(EquipoService equipos, AccesorioRepository accesorios) {
        this.equipos = equipos;
        this.accesorios = accesorios;
    }

    /** Hoja «Equipos»: un activo con serial por fila. */
    @Transactional(readOnly = true)
    public byte[] equipos(FiltroEquipos filtro) {
        List<Equipo> filas = equipos.listarSinPaginar(filtro);

        try (Workbook libro = new XSSFWorkbook()) {
            var hoja = libro.createSheet("Equipos");
            Estilos estilos = new Estilos(libro);

            encabezado(hoja, estilos, "INVENTARIO DE EQUIPOS", COLUMNAS_EQUIPOS, filas.size());
            Map<Integer, Integer> componentes = contarComponentes(filas);

            int n = 2;
            for (Equipo e : filas) {
                Row fila = hoja.createRow(n++);
                int c = 0;
                texto(fila, c++, e.getCodElemento(), estilos.celda);
                texto(fila, c++, e.getNombreElemento(), estilos.celda);
                texto(fila, c++, e.getSerial(), estilos.celda);
                texto(fila, c++, e.getModelo(), estilos.celda);
                texto(fila, c++, e.getTipo() == null ? null : e.getTipo().getTipo(), estilos.celda);
                texto(fila, c++, e.getMarca() == null ? null : e.getMarca().getMarca(), estilos.celda);
                texto(fila, c++, e.getEstado() == null ? null : e.getEstado().getEstado(), estilos.celda);
                texto(fila, c++, e.getUbicacion() == null ? null : e.getUbicacion().getUbicacion(), estilos.celda);
                texto(fila, c++, e.getPadre() == null ? null : e.getPadre().getCodElemento(), estilos.celda);
                numero(fila, c++, componentes.getOrDefault(e.getIdElemento(), 0), estilos.numero);
                texto(fila, c, e.getDescripcion(), estilos.celda);
            }

            cerrar(hoja, COLUMNAS_EQUIPOS.length, filas.size());
            return aBytes(libro);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo generar el archivo de Excel");
        }
    }

    /** Hoja «Repuestos y consumibles»: un lote (accesorio + ubicación) por fila. */
    public byte[] accesorios(String busqueda, Integer tipo, Integer marca, Integer ubicacion) {
        List<Map<String, Object>> items =
                accesorios.listar(busqueda, tipo, marca, ubicacion, 1, MAX_FILAS);

        try (Workbook libro = new XSSFWorkbook()) {
            var hoja = libro.createSheet("Repuestos y consumibles");
            Estilos estilos = new Estilos(libro);

            int totalFilas = 0;
            for (Map<String, Object> item : items) {
                totalFilas += Math.max(1, stocks(item).size());
            }

            encabezado(hoja, estilos, "REPUESTOS Y CONSUMIBLES", COLUMNAS_ACCESORIOS, totalFilas);

            int n = 2;
            for (Map<String, Object> item : items) {
                List<Map<String, Object>> lotes = stocks(item);
                if (lotes.isEmpty()) {
                    // Un accesorio dado de alta al que todavía no se le ha
                    // repartido existencia. Sale igual, con la ubicación en
                    // blanco: ocultarlo haría cuadrar mal el conteo.
                    escribirAccesorio(hoja.createRow(n++), estilos, item, null);
                    continue;
                }
                for (Map<String, Object> lote : lotes) {
                    escribirAccesorio(hoja.createRow(n++), estilos, item, lote);
                }
            }

            cerrar(hoja, COLUMNAS_ACCESORIOS.length, totalFilas);
            return aBytes(libro);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo generar el archivo de Excel");
        }
    }

    // ---------------------------------------------------------------- filas

    private void escribirAccesorio(Row fila, Estilos estilos,
            Map<String, Object> item, Map<String, Object> lote) {

        Integer total = lote == null ? entero(item.get("cantidad_total"))
                                     : entero(lote.get("cantidad_total"));
        Integer libre = lote == null ? entero(item.get("cantidad_disponible"))
                                     : entero(lote.get("cantidad_disponible"));

        int c = 0;
        texto(fila, c++, cadena(item.get("nombre")), estilos.celda);
        texto(fila, c++, cadena(item.get("modelo")), estilos.celda);
        texto(fila, c++, anidado(item.get("tipo"), "tipo"), estilos.celda);
        texto(fila, c++, anidado(item.get("marca"), "marca"), estilos.celda);
        texto(fila, c++, lote == null ? "Sin asignar" : anidado(lote.get("ubicacion"), "ubicacion"), estilos.celda);
        numero(fila, c++, total, estilos.numero);
        numero(fila, c++, libre, estilos.numero);
        // «En uso» no está en la base: es la resta, y se calcula aquí para que
        // quien abra el archivo no tenga que hacerla a mano.
        numero(fila, c++, total == null || libre == null ? null : total - libre, estilos.numero);
        texto(fila, c, cadena(item.get("descripcion")), estilos.celda);
    }

    /**
     * Cuántos componentes cuelgan de cada equipo, contados de una pasada.
     *
     * De una pasada y no preguntando equipo por equipo: con un bucle dentro
     * de otro el trabajo crece al cuadrado, y lo que con 200 filas no se nota
     * con 20.000 deja el Excel colgado.
     */
    private Map<Integer, Integer> contarComponentes(List<Equipo> filas) {
        Map<Integer, Integer> conteo = new HashMap<>();
        for (Equipo e : filas) {
            if (e.getPadre() != null && e.getPadre().getIdElemento() != null) {
                conteo.merge(e.getPadre().getIdElemento(), 1, Integer::sum);
            }
        }
        return conteo;
    }

    // -------------------------------------------------------------- formato

    /** Fila 0: título con el total. Fila 1: nombres de columna. */
    private void encabezado(org.apache.poi.ss.usermodel.Sheet hoja, Estilos estilos,
            String titulo, String[] columnas, int total) {

        Row cabecera = hoja.createRow(0);
        Cell celdaTitulo = cabecera.createCell(0);
        celdaTitulo.setCellValue(titulo + " · " + total + (total == 1 ? " registro" : " registros"));
        celdaTitulo.setCellStyle(estilos.titulo);
        cabecera.setHeightInPoints(22);
        hoja.addMergedRegion(new CellRangeAddress(0, 0, 0, columnas.length - 1));

        Row fila = hoja.createRow(1);
        for (int i = 0; i < columnas.length; i++) {
            Cell celda = fila.createCell(i);
            celda.setCellValue(columnas[i]);
            celda.setCellStyle(estilos.encabezado);
        }
    }

    /** Ancho de columnas, filtros de Excel y fijar la cabecera al desplazar. */
    private void cerrar(org.apache.poi.ss.usermodel.Sheet hoja, int columnas, int filas) {
        for (int i = 0; i < columnas; i++) {
            hoja.autoSizeColumn(i);
            // autoSizeColumn deja columnas larguísimas con las descripciones.
            int ancho = Math.min(hoja.getColumnWidth(i) + 512, 12_000);
            hoja.setColumnWidth(i, ancho);
        }
        if (filas > 0) {
            hoja.setAutoFilter(new CellRangeAddress(1, 1 + filas, 0, columnas - 1));
        }
        hoja.createFreezePane(0, 2);
    }

    private byte[] aBytes(Workbook libro) throws IOException {
        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        libro.write(salida);
        return salida.toByteArray();
    }

    private void texto(Row fila, int columna, String valor, CellStyle estilo) {
        Cell celda = fila.createCell(columna);
        celda.setCellValue(valor == null ? "" : valor);
        celda.setCellStyle(estilo);
    }

    private void numero(Row fila, int columna, Integer valor, CellStyle estilo) {
        Cell celda = fila.createCell(columna);
        if (valor != null) {
            celda.setCellValue(valor);
        }
        celda.setCellStyle(estilo);
    }

    private static String cadena(Object valor) {
        return valor == null ? null : valor.toString();
    }

    private static Integer entero(Object valor) {
        return valor instanceof Number n ? n.intValue() : null;
    }

    /** Saca un campo de los mapas anidados que arma AccesorioRepository. */
    @SuppressWarnings("unchecked")
    private static String anidado(Object mapa, String clave) {
        if (mapa instanceof Map<?, ?> m) {
            return cadena(((Map<String, Object>) m).get(clave));
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> stocks(Map<String, Object> item) {
        Object valor = item.get("stocks");
        return valor instanceof List<?> lista ? (List<Map<String, Object>>) lista : List.of();
    }

    /**
     * Los estilos se crean una vez por libro. Crear uno por celda es el error
     * clásico con POI: Excel tiene un tope de 64.000 estilos y el archivo se
     * corrompe mucho antes de llegar ahí.
     */
    private static final class Estilos {
        final CellStyle titulo;
        final CellStyle encabezado;
        final CellStyle celda;
        final CellStyle numero;

        Estilos(Workbook libro) {
            Font fuenteTitulo = libro.createFont();
            fuenteTitulo.setFontName("Arial");
            fuenteTitulo.setBold(true);
            fuenteTitulo.setFontHeightInPoints((short) 14);

            titulo = libro.createCellStyle();
            titulo.setFont(fuenteTitulo);
            titulo.setAlignment(HorizontalAlignment.LEFT);

            Font fuenteEncabezado = libro.createFont();
            fuenteEncabezado.setFontName("Arial");
            fuenteEncabezado.setBold(true);
            fuenteEncabezado.setColor(IndexedColors.WHITE.getIndex());

            encabezado = libro.createCellStyle();
            encabezado.setFont(fuenteEncabezado);
            encabezado.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            encabezado.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            encabezado.setAlignment(HorizontalAlignment.CENTER);
            bordes(encabezado);

            Font fuente = libro.createFont();
            fuente.setFontName("Arial");

            celda = libro.createCellStyle();
            celda.setFont(fuente);
            bordes(celda);

            numero = libro.createCellStyle();
            numero.setFont(fuente);
            numero.setAlignment(HorizontalAlignment.CENTER);
            bordes(numero);
        }

        private static void bordes(CellStyle estilo) {
            estilo.setBorderTop(BorderStyle.THIN);
            estilo.setBorderBottom(BorderStyle.THIN);
            estilo.setBorderLeft(BorderStyle.THIN);
            estilo.setBorderRight(BorderStyle.THIN);
        }
    }
}
