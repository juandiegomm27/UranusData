-- Estos valores ya existían en el catálogo del proyecto anterior.
-- Van en una migración nueva para respetar bases donde V1–V6 ya corrieron.
INSERT INTO tipo_mantenimiento (cod_tipo_mantenimiento, tipo) VALUES
    (1, 'Preventivo'),
    (2, 'Correctivo'),
    (3, 'Actualización/Mejora'),
    (4, 'Revisión Técnica')
ON CONFLICT (cod_tipo_mantenimiento) DO NOTHING;

SELECT setval(pg_get_serial_sequence('tipo_mantenimiento', 'cod_tipo_mantenimiento'),
              GREATEST((SELECT COALESCE(MAX(cod_tipo_mantenimiento), 1) FROM tipo_mantenimiento), 1));
