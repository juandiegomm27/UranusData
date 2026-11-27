package com.uranusdata.inventario.exportacion.controller;

import com.uranusdata.inventario.equipos.dto.FiltroEquipos;
import com.uranusdata.inventario.exportacion.service.ExcelInventarioService;
import java.time.LocalDate;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Descarga del inventario en Excel.
 *
 * Una sola ruta para las dos pestañas de la pantalla, porque es un solo
 * botón: «tab» dice cuál se está viendo y el resto de parámetros son
 * exactamente los mismos que ya manda el listado. Así el archivo sale con
 * los filtros puestos, sin que Angular tenga que armar nada aparte.
 *
 * La ruta tiene tres segmentos (/inventario/exportar/excel) y no choca con
 * el /inventario/{id} del detalle, que tiene dos.
 *
 * No lleva @PreAuthorize: exportar es leer, y leer el inventario ya lo puede
 * hacer cualquiera que haya iniciado sesión, incluido el Docente. Quien no
 * tenga token no pasa del filtro de seguridad.
 */
@RestController
public class ExportacionInventarioController {

    private static final String XLSX =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final ExcelInventarioService excel;

    public ExportacionInventarioController(ExcelInventarioService excel) {
        this.excel = excel;
    }

    @GetMapping("/inventario/exportar/excel")
    public ResponseEntity<byte[]> exportar(
            @RequestParam(required = false, defaultValue = "activos") String tab,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer tipo,
            @RequestParam(required = false) Integer marca,
            @RequestParam(required = false) Integer ubicacion,
            @RequestParam(required = false) Integer estado,
            @RequestParam(required = false) String principales) {

        boolean accesorios = "accesorios".equalsIgnoreCase(tab);

        byte[] contenido;
        String nombre;

        if (accesorios) {
            contenido = excel.accesorios(search, tipo, marca, ubicacion);
            nombre = "inventario-repuestos-" + LocalDate.now() + ".xlsx";
        } else {
            FiltroEquipos filtro = new FiltroEquipos(search, tipo, marca, ubicacion, estado,
                    "1".equals(principales)
                            ? FiltroEquipos.Relacion.PRINCIPALES
                            : FiltroEquipos.Relacion.TODOS);
            contenido = excel.equipos(filtro);
            nombre = "inventario-equipos-" + LocalDate.now() + ".xlsx";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(nombre).build().toString())
                .contentType(MediaType.parseMediaType(XLSX))
                .body(contenido);
    }
}
