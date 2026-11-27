package com.uranusdata.inventario.equipos.controller;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import com.uranusdata.shared.web.ApiException;

/** Catálogos que administran los formularios de inventario. */
@RestController
public class CatalogosInventarioController {
    private final JdbcTemplate jdbc;
    public CatalogosInventarioController(JdbcTemplate jdbc){this.jdbc=jdbc;}
    public record Texto(String marca,String tipo,String ubicacion){}

    @GetMapping("/marcas") public List<Map<String,Object>> marcas(){return jdbc.queryForList("SELECT cod_marca,marca FROM marca ORDER BY marca");}
    @PostMapping("/marcas") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional
    @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> crearMarca(@RequestBody Texto d){
        String nombre=d.marca()==null?"":d.marca().trim(); validarNombre(nombre,"marca");
        if(existe("SELECT EXISTS(SELECT 1 FROM marca WHERE lower(btrim(marca))=lower(btrim(?)))",nombre)) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Ya existe una marca con ese nombre.");
        Map<String,Object> fila=jdbc.queryForMap("INSERT INTO marca(marca) VALUES(?) RETURNING cod_marca,marca",nombre); return Map.of("success",true,"marca",fila,"data",fila);
    }
    @DeleteMapping("/marcas/{id}") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional
    public Map<String,Object> borrarMarca(@PathVariable Integer id){
        if(existe("SELECT EXISTS(SELECT 1 FROM inventario WHERE cod_marca=?) OR EXISTS(SELECT 1 FROM inventario_accesorios WHERE cod_marca=?)",id,id)) throw new ApiException(HttpStatus.BAD_REQUEST,"No se puede eliminar: la marca está en uso.");
        borrar("DELETE FROM marca WHERE cod_marca=?",id,"Marca no encontrada.");return ok("Marca eliminada.");
    }

    @PostMapping("/tipos-elemento") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional @ResponseStatus(HttpStatus.CREATED)
    public Map<String,Object> crearTipo(@RequestBody Texto d){String n=d.tipo()==null?"":d.tipo().trim();validarNombre(n,"tipo");if(existe("SELECT EXISTS(SELECT 1 FROM tipo_elemento WHERE lower(btrim(tipo))=lower(btrim(?)))",n))throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Ya existe un tipo con ese nombre.");Map<String,Object> f=jdbc.queryForMap("INSERT INTO tipo_elemento(tipo) VALUES(?) RETURNING cod_tipo_elemento,tipo",n);return Map.of("success",true,"tipo",f,"data",f);}
    @PutMapping("/tipos-elemento/{id}") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional
    public Map<String,Object> actualizarTipo(@PathVariable Integer id,@RequestBody Texto d){String n=d.tipo()==null?"":d.tipo().trim();validarNombre(n,"tipo");if(existe("SELECT EXISTS(SELECT 1 FROM tipo_elemento WHERE lower(btrim(tipo))=lower(btrim(?)) AND cod_tipo_elemento<>?)",n,id))throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Ya existe un tipo con ese nombre.");actualizar("UPDATE tipo_elemento SET tipo=? WHERE cod_tipo_elemento=?",n,id,"Tipo no encontrado.");return ok("Tipo actualizado.");}
    @DeleteMapping("/tipos-elemento/{id}") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional
    public Map<String,Object> borrarTipo(@PathVariable Integer id){if(existe("SELECT EXISTS(SELECT 1 FROM inventario WHERE cod_tipo_elemento=?) OR EXISTS(SELECT 1 FROM inventario_accesorios WHERE cod_tipo_elemento=?)",id,id))throw new ApiException(HttpStatus.BAD_REQUEST,"No se puede eliminar: el tipo está en uso.");borrar("DELETE FROM tipo_elemento WHERE cod_tipo_elemento=?",id,"Tipo no encontrado.");return ok("Tipo eliminado.");}

    @PostMapping("/ubicaciones") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional @ResponseStatus(HttpStatus.CREATED)
    public Map<String,Object> crearUbicacion(@RequestBody Texto d){String n=d.ubicacion()==null?"":d.ubicacion().trim();validarNombre(n,"ubicación");List<Map<String,Object>> found=jdbc.queryForList("SELECT cod_ubi_elemento,ubicacion FROM ubi_elemento WHERE lower(btrim(ubicacion))=lower(btrim(?))",n);Map<String,Object> f=found.isEmpty()?jdbc.queryForMap("INSERT INTO ubi_elemento(ubicacion) VALUES(?) RETURNING cod_ubi_elemento,ubicacion",n):found.get(0);return Map.of("success",true,"ubicacion",f,"data",f);}
    @DeleteMapping("/ubicaciones/{id}") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional
    public Map<String,Object> borrarUbicacion(@PathVariable Integer id){if(existe("SELECT EXISTS(SELECT 1 FROM inventario WHERE cod_ubi_elemento=?) OR EXISTS(SELECT 1 FROM stock_accesorios WHERE cod_ubi_elemento=?)",id,id))throw new ApiException(HttpStatus.BAD_REQUEST,"No se puede eliminar: la ubicación tiene inventario asociado.");borrar("DELETE FROM ubi_elemento WHERE cod_ubi_elemento=?",id,"Ubicación no encontrada.");return ok("Ubicación eliminada.");}

    private boolean existe(String sql,Object... a){return Boolean.TRUE.equals(jdbc.queryForObject(sql,Boolean.class,a));}
    private void borrar(String sql,Integer id,String error){if(jdbc.update(sql,id)==0)throw new ApiException(HttpStatus.NOT_FOUND,error);}
    private void actualizar(String sql,Object a,Object b,String error){if(jdbc.update(sql,a,b)==0)throw new ApiException(HttpStatus.NOT_FOUND,error);}
    private static void validarNombre(String n,String campo){if(n.isBlank()||n.length()>100)throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"La "+campo+" es obligatoria y debe tener máximo 100 caracteres.");}
    private static Map<String,Object> ok(String mensaje){return Map.of("success",true,"mensaje",mensaje);}
}
