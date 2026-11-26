package com.uranusdata.inventario.equipos.controller;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import com.uranusdata.shared.web.ApiException;

/** Accesorios en cantidades, con existencias independientes por ubicación. */
@RestController
@RequestMapping("/inventario-accesorios")
public class InventarioAccesoriosController {
    private final JdbcTemplate jdbc;
    public InventarioAccesoriosController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public record AccesorioRequest(@com.fasterxml.jackson.annotation.JsonProperty("id_accesorio") Integer id,
        String nombre, String modelo, String descripcion,
        @com.fasterxml.jackson.annotation.JsonProperty("cod_tipo_elemento") Integer tipo,
        @com.fasterxml.jackson.annotation.JsonProperty("cod_marca") Integer marca,
        @com.fasterxml.jackson.annotation.JsonProperty("cantidad_total") Integer cantidad,
        @com.fasterxml.jackson.annotation.JsonProperty("cod_ubi_elemento") Integer ubicacion) {}
    public record TrasladoRequest(@com.fasterxml.jackson.annotation.JsonProperty("id_stock_origen") Integer origen,
        @com.fasterxml.jackson.annotation.JsonProperty("cod_ubi_destino") Integer destino, Integer cantidad) {}

    @GetMapping
    public Map<String,Object> listar(@RequestParam(required=false) String search,
        @RequestParam(required=false) Integer tipo, @RequestParam(required=false) Integer marca,
        @RequestParam(required=false) Integer ubicacion, @RequestParam(required=false) Integer page,
        @RequestParam(name="per_page",required=false) Integer perPage) {
        int pag=page==null||page<1?1:page, tam=perPage==null||perPage<1?10:Math.min(perPage,100);
        String q="%"+(search==null?"":search.trim())+"%";
        String where=" WHERE (CAST(? AS INTEGER) IS NULL OR a.cod_tipo_elemento=?) AND (CAST(? AS INTEGER) IS NULL OR a.cod_marca=?) AND (CAST(? AS INTEGER) IS NULL OR EXISTS(SELECT 1 FROM stock_accesorios sx WHERE sx.id_accesorio=a.id_accesorio AND sx.cod_ubi_elemento=?)) AND (?='' OR a.nombre ILIKE ? OR COALESCE(a.modelo,'') ILIKE ? OR COALESCE(a.descripcion,'') ILIKE ? OR EXISTS(SELECT 1 FROM marca mx WHERE mx.cod_marca=a.cod_marca AND mx.marca ILIKE ?))";
        Object[] args={tipo,tipo,marca,marca,ubicacion,ubicacion,search==null?"":search.trim(),q,q,q,q};
        Integer total=jdbc.queryForObject("SELECT count(*) FROM inventario_accesorios a"+where,Integer.class,args);
        List<Map<String,Object>> rows=jdbc.queryForList("SELECT a.*,t.tipo AS tipo_nombre,m.marca AS marca_nombre FROM inventario_accesorios a LEFT JOIN tipo_elemento t USING(cod_tipo_elemento) LEFT JOIN marca m USING(cod_marca)"+where+" ORDER BY a.nombre LIMIT ? OFFSET ?",append(args,tam,(pag-1)*tam));
        List<Map<String,Object>> data=new ArrayList<>();
        for(Map<String,Object> row:rows){
            Integer id=(Integer)row.get("id_accesorio");
            List<Map<String,Object>> stocks=jdbc.queryForList("SELECT s.*,u.ubicacion FROM stock_accesorios s JOIN ubi_elemento u USING(cod_ubi_elemento) WHERE s.id_accesorio=? AND (? IS NULL OR s.cod_ubi_elemento=?) ORDER BY u.ubicacion",id,ubicacion,ubicacion);
            Map<String,Object> item=new LinkedHashMap<>(row); item.remove("tipo_nombre"); item.remove("marca_nombre");
            item.put("tipo", row.get("tipo_nombre")==null?null:Map.of("tipo",row.get("tipo_nombre")));
            item.put("marca", row.get("marca_nombre")==null?null:Map.of("marca",row.get("marca_nombre")));
            item.put("stocks",stocks); data.add(item);
        }
        return Map.of("success",true,"data",data,"total",total,"last_page",Math.max(1,(int)Math.ceil((double)total/tam)));
    }

    @PostMapping @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String,Object> crear(@RequestBody AccesorioRequest d){
        if(d.nombre()==null||d.nombre().isBlank()||d.nombre().trim().length()>100||d.cantidad()==null||d.cantidad()<1||d.ubicacion()==null)
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Nombre, cantidad positiva y ubicación son obligatorios.");
        validarCatalogos(d.tipo(),d.marca(),d.ubicacion());
        Integer id=d.id();
        if(id==null){
            if(Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM inventario_accesorios WHERE lower(btrim(nombre))=lower(btrim(?)))",Boolean.class,d.nombre())))
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Ya existe un accesorio con ese nombre. Selecciónalo de la lista para añadir stock.");
            id=jdbc.queryForObject("INSERT INTO inventario_accesorios(nombre,modelo,descripcion,cod_tipo_elemento,cod_marca,cantidad_total,cantidad_disponible) VALUES(?,?,?,?,?,?,?) RETURNING id_accesorio",Integer.class,d.nombre().trim(),d.modelo(),d.descripcion(),d.tipo(),d.marca(),d.cantidad(),d.cantidad());
        } else {
            int found=jdbc.update("UPDATE inventario_accesorios SET cantidad_total=cantidad_total+?,cantidad_disponible=cantidad_disponible+? WHERE id_accesorio=?",d.cantidad(),d.cantidad(),id);
            if(found==0) throw new ApiException(HttpStatus.NOT_FOUND,"Accesorio no encontrado.");
        }
        jdbc.update("INSERT INTO stock_accesorios(id_accesorio,cod_ubi_elemento,cantidad_total,cantidad_disponible) VALUES(?,?,?,?) ON CONFLICT(id_accesorio,cod_ubi_elemento) DO UPDATE SET cantidad_total=stock_accesorios.cantidad_total+EXCLUDED.cantidad_total,cantidad_disponible=stock_accesorios.cantidad_disponible+EXCLUDED.cantidad_disponible",id,d.ubicacion(),d.cantidad(),d.cantidad());
        return Map.of("success",true,"mensaje","Accesorio y existencias guardados.","data",Map.of("id_accesorio",id));
    }

    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional
    public Map<String,Object> actualizar(@PathVariable Integer id,@RequestBody AccesorioRequest d){
        if(d.nombre()==null||d.nombre().isBlank()) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"El nombre es obligatorio.");
        validarCatalogos(d.tipo(),d.marca(),null);
        if(Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM inventario_accesorios WHERE lower(btrim(nombre))=lower(btrim(?)) AND id_accesorio<>?)",Boolean.class,d.nombre(),id)))
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Ya existe otro accesorio con ese nombre.");
        int n=jdbc.update("UPDATE inventario_accesorios SET nombre=?,modelo=?,descripcion=?,cod_tipo_elemento=?,cod_marca=? WHERE id_accesorio=?",d.nombre().trim(),d.modelo(),d.descripcion(),d.tipo(),d.marca(),id);
        if(n==0) throw new ApiException(HttpStatus.NOT_FOUND,"Accesorio no encontrado.");
        return Map.of("success",true,"mensaje","Accesorio actualizado.");
    }

    @PostMapping("/trasladar") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional
    public Map<String,Object> trasladar(@RequestBody TrasladoRequest d){
        if(d.cantidad()==null||d.cantidad()<1) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"La cantidad debe ser mayor que cero.");
        Map<String,Object> source=jdbc.query("SELECT * FROM stock_accesorios WHERE id_stock=? FOR UPDATE",rs->{if(!rs.next())return null;Map<String,Object> m=new HashMap<>();m.put("id_accesorio",rs.getInt("id_accesorio"));m.put("ubicacion",rs.getInt("cod_ubi_elemento"));m.put("cantidad",rs.getInt("cantidad_disponible"));return m;},d.origen());
        if(source==null) throw new ApiException(HttpStatus.NOT_FOUND,"Lote de origen no encontrado.");
        if(d.destino()==null||!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM ubi_elemento WHERE cod_ubi_elemento=?)",Boolean.class,d.destino()))) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"La ubicación de destino no existe.");
        if(((Integer)source.get("cantidad"))<d.cantidad()) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"No hay suficientes unidades disponibles en el origen.");
        if(Objects.equals(source.get("ubicacion"),d.destino())) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"El origen y destino deben ser diferentes.");
        jdbc.update("UPDATE stock_accesorios SET cantidad_total=cantidad_total-?,cantidad_disponible=cantidad_disponible-? WHERE id_stock=?",d.cantidad(),d.cantidad(),d.origen());
        jdbc.update("INSERT INTO stock_accesorios(id_accesorio,cod_ubi_elemento,cantidad_total,cantidad_disponible) VALUES(?,?,?,?) ON CONFLICT(id_accesorio,cod_ubi_elemento) DO UPDATE SET cantidad_total=stock_accesorios.cantidad_total+EXCLUDED.cantidad_total,cantidad_disponible=stock_accesorios.cantidad_disponible+EXCLUDED.cantidad_disponible",source.get("id_accesorio"),d.destino(),d.cantidad(),d.cantidad());
        return Map.of("success",true,"mensaje","Traslado de existencias completado.");
    }

    private static Object[] append(Object[] a,Object... b){Object[] out=Arrays.copyOf(a,a.length+b.length);System.arraycopy(b,0,out,a.length,b.length);return out;}
    private void validarCatalogos(Integer tipo,Integer marca,Integer ubicacion){
        if(tipo!=null&&!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM tipo_elemento WHERE cod_tipo_elemento=?)",Boolean.class,tipo)))throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"El tipo seleccionado no existe.");
        if(marca!=null&&!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM marca WHERE cod_marca=?)",Boolean.class,marca)))throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"La marca seleccionada no existe.");
        if(ubicacion!=null&&!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM ubi_elemento WHERE cod_ubi_elemento=?)",Boolean.class,ubicacion)))throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"La ubicación seleccionada no existe.");
    }
}
