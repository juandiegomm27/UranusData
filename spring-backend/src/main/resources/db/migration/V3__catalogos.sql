-- V3 · CATÁLOGOS

INSERT INTO rol (cod_rol, cargo) VALUES
    (1, 'Docente'), (2, 'Tecnico'), (3, 'Gerente');

INSERT INTO estado_usuario (cod_estado_usuario, estado) VALUES
    (1, 'Activo'), (2, 'Inactivo'), (3, 'Bloqueado');

INSERT INTO estado_elemento (cod_estado_elemento, estado) VALUES
    (1, 'Activo'), (2, 'En préstamo'), (3, 'Mantenimiento'), (4, 'Baja');

INSERT INTO tipo_elemento (cod_tipo_elemento, tipo) VALUES
    (1, 'Computador'), (2, 'Monitor'), (3, 'Proyector'), (4, 'Accesorio'),
    (5, 'Impresora'),  (6, 'Router'),  (7, 'Servidor'),  (8, 'Webcam');

INSERT INTO ubi_elemento (cod_ubi_elemento, ubicacion) VALUES
    (1, 'Sala 1'), (2, 'Sala 2'), (3, 'Almacén Central'), (4, 'Sala 3'),
    (5, 'Laboratorio de Redes'), (6, 'Biblioteca'), (7, 'Dirección Académica');

INSERT INTO estado_mantenimiento (cod_estado_mantenimiento, estado) VALUES
    (1, 'Pendiente'), (2, 'En proceso'), (3, 'Finalizado'), (4, 'Dado de baja');

INSERT INTO estado_reserva (num_estado, estado) VALUES
    (1, 'Pendiente'), (2, 'Aprobada'), (3, 'Rechazada');

INSERT INTO estado_prestamo (cod_estado_prestamo, estado) VALUES
    (1, 'Solicitado'), (2, 'Entregado'), (3, 'Devuelto'), (4, 'Perdido'), (5, 'Dañado');

INSERT INTO marca (marca) VALUES
    ('Dell'), ('HP'), ('Lenovo'), ('LG'), ('Epson'), ('Sony'),
    ('Brother'), ('Logitech'), ('Samsung'), ('Acer'), ('Genérica');

-- Como se insertaron IDs explícitos, hay que avanzar las secuencias
SELECT setval(pg_get_serial_sequence('rol', 'cod_rol'), (SELECT MAX(cod_rol) FROM rol));
SELECT setval(pg_get_serial_sequence('estado_usuario', 'cod_estado_usuario'), (SELECT MAX(cod_estado_usuario) FROM estado_usuario));
SELECT setval(pg_get_serial_sequence('estado_elemento', 'cod_estado_elemento'), (SELECT MAX(cod_estado_elemento) FROM estado_elemento));
SELECT setval(pg_get_serial_sequence('tipo_elemento', 'cod_tipo_elemento'), (SELECT MAX(cod_tipo_elemento) FROM tipo_elemento));
SELECT setval(pg_get_serial_sequence('ubi_elemento', 'cod_ubi_elemento'), (SELECT MAX(cod_ubi_elemento) FROM ubi_elemento));
SELECT setval(pg_get_serial_sequence('tipo_mantenimiento', 'cod_tipo_mantenimiento'), (SELECT MAX(cod_tipo_mantenimiento) FROM tipo_mantenimiento));
SELECT setval(pg_get_serial_sequence('estado_mantenimiento', 'cod_estado_mantenimiento'), (SELECT MAX(cod_estado_mantenimiento) FROM estado_mantenimiento));
SELECT setval(pg_get_serial_sequence('estado_reserva', 'num_estado'), (SELECT MAX(num_estado) FROM estado_reserva));
SELECT setval(pg_get_serial_sequence('estado_prestamo', 'cod_estado_prestamo'), (SELECT MAX(cod_estado_prestamo) FROM estado_prestamo));