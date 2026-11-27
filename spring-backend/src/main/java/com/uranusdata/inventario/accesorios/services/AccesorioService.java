package com.uranusdata.inventario.accesorios.services;

import com.uranusdata.inventario.accesorios.domain.Accesorio;
import com.uranusdata.inventario.accesorios.domain.StockAccesorio;
import com.uranusdata.inventario.accesorios.dto.AccesorioPageResponse;
import com.uranusdata.inventario.accesorios.dto.AccesorioRequest;
import com.uranusdata.inventario.accesorios.dto.BajaAccesorioRequest;
import com.uranusdata.inventario.accesorios.dto.TrasladoStockRequest;
import com.uranusdata.inventario.accesorios.repository.AccesorioRepository;
import com.uranusdata.shared.web.ApiException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Reglas para accesorios y existencias repartidas entre ubicaciones. */
@Service
public class AccesorioService {
    private static final int MAX_POR_PAGINA = 100;
    private final AccesorioRepository accesorios;

    public AccesorioService(AccesorioRepository accesorios) { this.accesorios = accesorios; }

    @Transactional(readOnly = true)
    public AccesorioPageResponse listar(String busqueda, Integer tipo, Integer marca,
                                        Integer ubicacion, Integer pagina, Integer porPagina) {
        int page = pagina == null || pagina < 1 ? 1 : pagina;
        int size = porPagina == null || porPagina < 1 ? 10 : Math.min(porPagina, MAX_POR_PAGINA);
        long total = accesorios.contar(busqueda, tipo, marca, ubicacion);
        List<Map<String, Object>> data = accesorios.listar(busqueda, tipo, marca, ubicacion, page, size);
        return new AccesorioPageResponse(true, data, total, Math.max(1, (int) Math.ceil((double) total / size)));
    }

    @Transactional
    public Map<String, Object> guardar(AccesorioRequest datos) {
        validarNombre(datos.nombre());
        if (datos.cantidadTotal() == null || datos.cantidadTotal() < 1 || datos.codUbiElemento() == null) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La cantidad debe ser positiva y la ubicación es obligatoria.");
        }
        validarCatalogos(datos.codTipoElemento(), datos.codMarca(), datos.codUbiElemento());

        Integer id = datos.idAccesorio();
        if (id == null) {
            if (accesorios.existeNombre(datos.nombre(), null)) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Ya existe un accesorio con ese nombre. Selecciónalo de la lista para añadir existencias.");
            }
            Accesorio nuevo = new Accesorio(null, datos.nombre().trim(), datos.modelo(), datos.descripcion(),
                    datos.codTipoElemento(), datos.codMarca(), datos.cantidadTotal(), datos.cantidadTotal());
            id = accesorios.crear(nuevo);
        } else {
            if (!accesorios.existe(id)) throw new ApiException(HttpStatus.NOT_FOUND, "Accesorio no encontrado.");
            accesorios.sumarExistencias(id, datos.cantidadTotal());
        }
        accesorios.guardarStock(id, datos.codUbiElemento(), datos.cantidadTotal());
        return Map.of("success", true, "mensaje", "Accesorio y existencias guardados.",
                "data", Map.of("id_accesorio", id));
    }

    @Transactional
    public Map<String, Object> actualizar(Integer id, AccesorioRequest datos) {
        validarNombre(datos.nombre());
        validarCatalogos(datos.codTipoElemento(), datos.codMarca(), null);
        if (accesorios.existeNombre(datos.nombre(), id)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Ya existe otro accesorio con ese nombre.");
        }
        Accesorio cambios = new Accesorio(id, datos.nombre().trim(), datos.modelo(), datos.descripcion(),
                datos.codTipoElemento(), datos.codMarca(), null, null);
        if (accesorios.actualizar(cambios) == 0) throw new ApiException(HttpStatus.NOT_FOUND, "Accesorio no encontrado.");
        return Map.of("success", true, "mensaje", "Accesorio actualizado.");
    }

    @Transactional
    public Map<String, Object> trasladar(TrasladoStockRequest datos) {
        StockAccesorio origen = accesorios.bloquearStock(datos.idStockOrigen());
        if (origen == null) throw new ApiException(HttpStatus.NOT_FOUND, "Lote de origen no encontrado.");
        if (!accesorios.existeUbicacion(datos.codUbiDestino())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La ubicación de destino no existe.");
        }
        if (origen.codUbiElemento().equals(datos.codUbiDestino())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El origen y el destino deben ser diferentes.");
        }
        if (datos.cantidad() > origen.cantidadDisponible()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "No hay suficientes unidades disponibles en el origen.");
        }
        accesorios.descontarStock(origen.idStock(), datos.cantidad());
        accesorios.guardarStock(origen.idAccesorio(), datos.codUbiDestino(), datos.cantidad());
        return Map.of("success", true, "mensaje", "Traslado de existencias completado.");
    }

    @Transactional
    public Map<String, Object> darDeBaja(Integer idStock, BajaAccesorioRequest datos) {
        StockAccesorio stock = accesorios.bloquearStock(idStock);
        if (stock == null) throw new ApiException(HttpStatus.NOT_FOUND, "El lote de stock no existe.");
        if (datos.cantidad() > stock.cantidadDisponible()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "No puedes dar de baja más unidades de las disponibles en esta ubicación.");
        }
        Accesorio accesorio = accesorios.buscarPorId(stock.idAccesorio());
        String ubicacion = accesorios.nombreUbicacion(stock.codUbiElemento());
        accesorios.registrarBaja(idStock, accesorio.idAccesorio(), accesorio.nombre(), accesorio.modelo(),
                accesorio.descripcion(), accesorio.codTipoElemento(), stock.codUbiElemento(), ubicacion,
                datos.cantidad(), datos.motivo());
        return Map.of("success", true, "mensaje", "Unidades dadas de baja correctamente.");
    }

    private void validarCatalogos(Integer tipo, Integer marca, Integer ubicacion) {
        if (tipo != null && !accesorios.existeTipo(tipo)) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El tipo seleccionado no existe.");
        if (marca != null && !accesorios.existeMarca(marca)) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La marca seleccionada no existe.");
        if (ubicacion != null && !accesorios.existeUbicacion(ubicacion)) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La ubicación seleccionada no existe.");
    }

    private static void validarNombre(String nombre) {
        if (nombre == null || nombre.isBlank() || nombre.trim().length() > 100) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El nombre es obligatorio y permite hasta 100 caracteres.");
        }
    }
}
