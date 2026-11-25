-- EQUIPOS (elementos con serial)

INSERT INTO
    inventario (
        cod_elemento,
        nombre_elemento,
        serial,
        modelo,
        descripcion,
        cod_tipo_elemento,
        cod_marca,
        cod_estado_elemento,
        cod_ubi_elemento
    )
SELECT s.cod, s.nombre, s.serial, s.modelo, s.descripcion, (
        SELECT cod_tipo_elemento
        FROM tipo_elemento
        WHERE
            tipo = s.tipo
    ), (
        SELECT cod_marca
        FROM marca
        WHERE
            marca = s.marca
    ), (
        SELECT cod_estado_elemento
        FROM estado_elemento
        WHERE
            estado = s.estado
    ), (
        SELECT cod_ubi_elemento
        FROM ubi_elemento
        WHERE
            ubicacion = s.ubicacion
    )
FROM (
        VALUES (
                'PORT-001', 'Laptop Lenovo ThinkPad', 'LNV-8821', 'E14 Gen 2', 'Asignada a coordinación académica.', 'Computador', 'Lenovo', 'Activo', 'Almacén Central'
            ), (
                'CARG-001', 'Cargador Lenovo 65W', 'LNV-CH-001', NULL, NULL, 'Accesorio', 'Lenovo', 'Activo', 'Almacén Central'
            ), (
                'MOU-001', 'Mouse inalámbrico Logitech', 'LG-MS-001', NULL, NULL, 'Accesorio', 'Logitech', 'Activo', 'Almacén Central'
            ), (
                'COMP-003', 'Torre HP ProDesk 400', 'HP-5542', 'ProDesk 400', 'Equipo de la sala de sistemas.', 'Computador', 'HP', 'Activo', 'Sala 2'
            ), (
                'MON-002', 'Monitor Dell 24 Pulgadas', 'DL-7731', 'P2419H', NULL, 'Monitor', 'Dell', 'Mantenimiento', 'Sala 2'
            ), (
                'PROY-002', 'Proyector Sony VPL', 'SN-4021', 'VPL-DX221', NULL, 'Proyector', 'Sony', 'En préstamo', 'Sala 1'
            ), (
                'IMP-001', 'Impresora Multifuncional Brother', 'BR-3392', 'DCP-L2540', NULL, 'Impresora', 'Brother', 'Activo', 'Almacén Central'
            )
    ) AS s (
        cod, nombre, serial, modelo, descripcion, tipo, marca, estado, ubicacion
    );

UPDATE inventario
SET
    id_elemento_padre = (
        SELECT id_elemento
        FROM inventario
        WHERE
            cod_elemento = 'PORT-001'
    )
WHERE
    cod_elemento IN ('CARG-001', 'MOU-001');

-- ACCESORIOS (sin serial, se cuentan por cantidad)

INSERT INTO
    inventario_accesorios (
        nombre,
        modelo,
        descripcion,
        cod_tipo_elemento,
        cod_marca,
        cantidad_total,
        cantidad_disponible
    )
SELECT s.nombre, s.modelo, NULL, (
        SELECT cod_tipo_elemento
        FROM tipo_elemento
        WHERE
            tipo = 'Accesorio'
    ), (
        SELECT cod_marca
        FROM marca
        WHERE
            marca = 'Genérica'
    ), s.total, s.disponible
FROM (
        VALUES (
                'Gancho metálico', NULL, 50, 50
            ), (
                'Cable HDMI 2 m', 'HDMI-2M', 20, 20
            )
    ) AS s (
        nombre, modelo, total, disponible
    );

INSERT INTO
    stock_accesorios (
        id_accesorio,
        cod_ubi_elemento,
        cantidad_total,
        cantidad_disponible
    )
SELECT (
        SELECT id_accesorio
        FROM inventario_accesorios
        WHERE
            nombre = s.accesorio
    ), (
        SELECT cod_ubi_elemento
        FROM ubi_elemento
        WHERE
            ubicacion = s.ubicacion
    ), s.total, s.disponible
FROM (
        VALUES (
                'Gancho metálico', 'Almacén Central', 30, 30
            ), (
                'Gancho metálico', 'Sala 1', 20, 20
            ), (
                'Cable HDMI 2 m', 'Almacén Central', 15, 15
            ),
            (
                'Cable HDMI 2 m', 'Sala 3', 5, 5
            )
    ) AS s (
        accesorio, ubicacion, total, disponible
    );