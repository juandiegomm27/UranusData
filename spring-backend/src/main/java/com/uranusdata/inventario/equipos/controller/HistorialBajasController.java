package com.uranusdata.inventario.equipos.controller;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.uranusdata.shared.web.ApiException;

@RestController
@RequestMapping("/inventario")
public class HistorialBajasController {
    private final JdbcTemplate jdbc;
    public HistorialBajasController(JdbcTemplate jdbc){this.jdbc=jdbc;}

    // La baja de accesorios NO vive aquí: la sirve
    // inventario/accesorios/controller/BajaAccesorioController, que usa el
    // servicio y el repositorio del módulo de accesorios. Tener las dos
    // declarando POST /inventario/accesorios/{idStock}/dar-de-baja impedía
    // arrancar la aplicación con «Ambiguous mapping».

    @GetMapping("/historial-bajas-general")
    public Map<String,Object> historial(@RequestParam(required=false) String tipo,@RequestParam(required=false) Integer page){
        int p=page==null||page<1?1:page;String filtro=("activo".equals(tipo)||"accesorio".equals(tipo))?tipo:null;
        long total=jdbc.queryForObject("SELECT count(*) FROM historial_bajas_general WHERE CAST(? AS varchar) IS NULL OR tipo_item=?",Long.class,filtro,filtro);
        long unidades=jdbc.queryForObject("SELECT COALESCE(sum(cantidad),0) FROM historial_bajas_general WHERE CAST(? AS varchar) IS NULL OR tipo_item=?",Long.class,filtro,filtro);
        List<Map<String,Object>> all=jdbc.queryForList("SELECT * FROM historial_bajas_general WHERE CAST(? AS varchar) IS NULL OR tipo_item=? ORDER BY fecha_baja DESC,id_baja DESC LIMIT 15 OFFSET ?",filtro,filtro,(p-1)*15);
        return Map.of("success",true,"data",Map.of("data",all,"total",total,"current_page",p,"per_page",15,"last_page",Math.max(1,(int)Math.ceil(total/15.0))),"resumen",Map.of("registros",total,"unidades",unidades));
    }

    @PostMapping("/historial-bajas-general/{id}/restaurar") @PreAuthorize("hasAnyRole('Tecnico','Gerente')") @Transactional
    public Map<String,Object> restaurar(@PathVariable Integer id){
        Map<String,Object> b=jdbc.query("SELECT * FROM historial_bajas_general WHERE id_baja=? FOR UPDATE",rs->{if(!rs.next())return null;Map<String,Object> m=new HashMap<>();for(String c:List.of("tipo_item","id_original","id_accesorio","cantidad","cod_ubi_elemento"))m.put(c,rs.getObject(c));return m;},id);
        if(b==null)throw new ApiException(HttpStatus.NOT_FOUND,"El registro de baja no existe.");
        String tipo=(String)b.get("tipo_item");
        if("activo".equals(tipo)){
            int n=jdbc.update("UPDATE inventario SET cod_estado_elemento=1 WHERE id_elemento=?",b.get("id_original"));
            if(n==0)throw new ApiException(HttpStatus.NOT_FOUND,"El equipo ya no existe en el inventario.");
            jdbc.update("INSERT INTO inventario_movimientos(id_elemento,tipo,descripcion,datos) VALUES(?,'restauracion','Activo restaurado desde historial',jsonb_build_object('id_baja',?))",b.get("id_original"),id);
        }else{
            Integer acc=(Integer)b.get("id_accesorio"),ubi=(Integer)b.get("cod_ubi_elemento");Integer qty=(Integer)b.get("cantidad");
            if(acc==null||ubi==null||!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM inventario_accesorios WHERE id_accesorio=?) AND EXISTS(SELECT 1 FROM ubi_elemento WHERE cod_ubi_elemento=?)",Boolean.class,acc,ubi)))throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"No se puede restaurar: el accesorio o la ubicación ya no existen.");
            jdbc.update("INSERT INTO stock_accesorios(id_accesorio,cod_ubi_elemento,cantidad_total,cantidad_disponible) VALUES(?,?,?,?) ON CONFLICT(id_accesorio,cod_ubi_elemento) DO UPDATE SET cantidad_total=stock_accesorios.cantidad_total+EXCLUDED.cantidad_total,cantidad_disponible=stock_accesorios.cantidad_disponible+EXCLUDED.cantidad_disponible",acc,ubi,qty,qty);
            jdbc.update("UPDATE inventario_accesorios SET cantidad_total=cantidad_total+?,cantidad_disponible=cantidad_disponible+? WHERE id_accesorio=?",qty,qty,acc);
        }
        jdbc.update("DELETE FROM historial_bajas_general WHERE id_baja=?",id);
        return Map.of("success",true,"mensaje","Elemento restaurado exitosamente al inventario.");
    }
}
