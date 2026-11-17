CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TEMP TABLE semilla (
    documento          VARCHAR(20),
    nombre             VARCHAR(45),
    apellido           VARCHAR(45),
    cod_rol            INTEGER,
    cod_estado_usuario INTEGER,
    correo             VARCHAR(100),
    telefono           VARCHAR(20)
) ON COMMIT DROP;

INSERT INTO semilla (documento, nombre, apellido, cod_rol, cod_estado_usuario, correo, telefono) VALUES
    ('1234567890', 'Juan Diego', 'Medina Mahecha', 1, 1, '1234567890@gmail.com', NULL),
    ('1234567891', 'Juan Diego', 'Medina Mahecha', 2, 1, '1234567891@gmail.com', NULL),
    ('1234567892', 'Juan Diego', 'Medina Mahecha', 3, 1, '1234567892@gmail.com', NULL),
    ('1000000001', 'Carlos',     'López',      1, 1, 'carlos.lopez@gmail.com',        '3105551001'),
    ('1000000002', 'María',      'González',   1, 1, 'maria.gonzalez@gmail.com',      '3105551002'),
    ('1000000003', 'Pedro',      'Martínez',   1, 1, 'pedro.martinez@gmail.com',      '3105551003'),
    ('1000000004', 'Ana',        'Sánchez',    1, 1, 'ana.sanchez@gmail.com',         '3105551004'),
    ('1000000005', 'Jorge',      'Ramírez',    1, 1, 'jorge.ramirez@gmail.com',       '3105551005'),
    ('1000000006', 'Laura',      'Jiménez',    1, 2, 'laura.jimenez@gmail.com',       '3105551006'),
    ('1000000007', 'Francisco',  'Hernández',  2, 1, 'francisco.hernandez@gmail.com', '3115551007'),
    ('1000000008', 'Elena',      'Vargas',     2, 1, 'elena.vargas@gmail.com',        '3115551008'),
    ('1000000009', 'David',      'Flores',     2, 1, 'david.flores@gmail.com',        '3115551009'),
    ('1000000010', 'Sofía',      'Gómez',      2, 1, 'sofia.gomez@gmail.com',         '3115551010'),
    ('1000000011', 'Miguel',     'Fuentes',    3, 1, 'miguel.fuentes@gmail.com',      '3125551011'),
    ('1000000012', 'Gabriela',   'Medina',     3, 1, 'gabriela.medina@gmail.com',     '3125551012');

INSERT INTO usuario (documento, nombre, apellido, cod_rol, cod_estado_usuario, password)
SELECT s.documento, s.nombre, s.apellido, s.cod_rol, s.cod_estado_usuario, h.password
FROM semilla s
CROSS JOIN (SELECT crypt('1234567890', gen_salt('bf', 12)) AS password) h;

INSERT INTO correo (correo, documento)
SELECT correo, documento FROM semilla;

INSERT INTO telefono (telefono, documento)
SELECT telefono, documento FROM semilla WHERE telefono IS NOT NULL;