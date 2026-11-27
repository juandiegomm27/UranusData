-- Datos de ejemplo para probar el módulo de accesorios y sus existencias
-- distribuidas por ubicación. Los totales globales coinciden con la suma
-- de las cantidades registradas en stock_accesorios.

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
SELECT datos.nombre, datos.modelo, datos.descripcion, tipo.cod_tipo_elemento, marca.cod_marca, datos.cantidad_total, datos.cantidad_disponible
FROM (
        VALUES (
                'Cable de red Cat6 3 m',
                'CAT6-3M',
                'Cable de red para conexión de equipos en aulas y laboratorios.',
                'Genérica',
                30,
                30
            ),
            (
                'Adaptador USB-C a HDMI',
                'USBC-HDMI',
                'Adaptador para conectar computadores a pantallas y proyectores.',
                'Genérica',
                12,
                12
            ),
            (
                'Teclado USB',
                'K120',
                'Teclado USB para equipos de escritorio.',
                'Logitech',
                15,
                15
            ),
            (
                'Mouse óptico USB',
                'M90',
                'Mouse óptico USB para equipos de escritorio.',
                'Logitech',
                20,
                20
            ),
            (
                'Audífonos USB con micrófono',
                'H390',
                'Audífonos USB para clases y videoconferencias.',
                'Logitech',
                10,
                10
            )
    ) AS datos (
        nombre,
        modelo,
        descripcion,
        marca,
        cantidad_total,
        cantidad_disponible
    )
    JOIN tipo_elemento tipo ON tipo.tipo = 'Accesorio'
    JOIN marca ON marca.marca = datos.marca;

INSERT INTO
    stock_accesorios (
        id_accesorio,
        cod_ubi_elemento,
        cantidad_total,
        cantidad_disponible
    )
SELECT accesorio.id_accesorio, ubicacion.cod_ubi_elemento, datos.cantidad, datos.cantidad
FROM (
        VALUES (
                'Cable de red Cat6 3 m',
                'Almacén Central',
                20
            ),
            (
                'Cable de red Cat6 3 m',
                'Laboratorio de Redes',
                10
            ),
            (
                'Adaptador USB-C a HDMI',
                'Almacén Central',
                8
            ),
            (
                'Adaptador USB-C a HDMI',
                'Sala 1',
                4
            ),
            (
                'Teclado USB',
                'Almacén Central',
                10
            ),
            ('Teclado USB', 'Sala 2', 5),
            (
                'Mouse óptico USB',
                'Almacén Central',
                12
            ),
            (
                'Mouse óptico USB',
                'Sala 2',
                8
            ),
            (
                'Audífonos USB con micrófono',
                'Almacén Central',
                6
            ),
            (
                'Audífonos USB con micrófono',
                'Sala 3',
                4
            )
    ) AS datos (
        nombre_accesorio,
        nombre_ubicacion,
        cantidad
    )
    JOIN inventario_accesorios accesorio ON accesorio.nombre = datos.nombre_accesorio
    JOIN ubi_elemento ubicacion ON ubicacion.ubicacion = datos.nombre_ubicacion;