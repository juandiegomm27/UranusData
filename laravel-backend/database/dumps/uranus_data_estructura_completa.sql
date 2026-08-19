-- =====================================================
-- URANUS DATA - Script SQL Completo
-- Estructura de Base de Datos Completa (Sin Datos)
-- Incluye: Tablas + Índices + VIEWs + STORED PROCEDURES
-- =====================================================

-- Eliminar BD si existe
DROP DATABASE IF EXISTS UranusData;
CREATE DATABASE UranusData CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE UranusData;

--  TABLAS BASE =====================

CREATE TABLE rol (
  cod_rol INT AUTO_INCREMENT PRIMARY KEY,
  cargo VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE estado_usuario (
  cod_estado_usuario INT AUTO_INCREMENT PRIMARY KEY,
  estado VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuario (
  documento VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(45),
  apellido VARCHAR(45),
  cod_rol INT,
  cod_estado_usuario INT DEFAULT 1,
  password VARCHAR(255),
  FOREIGN KEY (cod_rol) REFERENCES rol(cod_rol),
  FOREIGN KEY (cod_estado_usuario) REFERENCES estado_usuario(cod_estado_usuario),
  INDEX idx_cod_rol (cod_rol),
  INDEX idx_cod_estado_usuario (cod_estado_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE correo (
  correo VARCHAR(100) PRIMARY KEY,
  documento VARCHAR(20),
  FOREIGN KEY (documento) REFERENCES usuario(documento),
  INDEX idx_documento (documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE telefono (
  telefono VARCHAR(20) PRIMARY KEY,
  documento VARCHAR(20),
  FOREIGN KEY (documento) REFERENCES usuario(documento),
  INDEX idx_documento (documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE estado_elemento (
  cod_estado_elemento INT AUTO_INCREMENT PRIMARY KEY,
  estado VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tipo_elemento (
  cod_tipo_elemento INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ubi_elemento (
  cod_ubi_elemento INT AUTO_INCREMENT PRIMARY KEY,
  ubicacion VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventario (
  id_elemento INT AUTO_INCREMENT PRIMARY KEY,
  cod_elemento VARCHAR(45),
  elemento VARCHAR(100),
  cod_tipo_elemento INT,
  cod_estado_elemento INT,
  cod_ubi_elemento INT,
  FOREIGN KEY (cod_tipo_elemento) REFERENCES tipo_elemento(cod_tipo_elemento),
  FOREIGN KEY (cod_estado_elemento) REFERENCES estado_elemento(cod_estado_elemento),
  FOREIGN KEY (cod_ubi_elemento) REFERENCES ubi_elemento(cod_ubi_elemento),
  INDEX idx_cod_tipo_elemento (cod_tipo_elemento),
  INDEX idx_cod_estado_elemento (cod_estado_elemento),
  INDEX idx_cod_ubi_elemento (cod_ubi_elemento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tipo_mantenimiento (
  cod_tipo_mantenimiento INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mantenimiento (
  id_mantenimiento INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE,
  cod_tipo_mantenimiento INT,
  documento VARCHAR(20),
  elemento VARCHAR(100),
  descripcion TEXT,
  FOREIGN KEY (cod_tipo_mantenimiento) REFERENCES tipo_mantenimiento(cod_tipo_mantenimiento),
  FOREIGN KEY (documento) REFERENCES usuario(documento),
  INDEX idx_cod_tipo_mantenimiento (cod_tipo_mantenimiento),
  INDEX idx_documento (documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE estado_reserva (
  Num_estado INT AUTO_INCREMENT PRIMARY KEY,
  estado VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Reserva (
  id_Reserva INT AUTO_INCREMENT PRIMARY KEY,
  Num_estado INT,
  documento VARCHAR(20),
  fecha DATE,
  plazo DATE,
  cantidad INT,
  elemento VARCHAR(100),
  FOREIGN KEY (Num_estado) REFERENCES estado_reserva(Num_estado),
  FOREIGN KEY (documento) REFERENCES usuario(documento),
  INDEX idx_Num_estado (Num_estado),
  INDEX idx_documento (documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE estado_prestamo (
  cod_estado_prestamo INT AUTO_INCREMENT PRIMARY KEY,
  estado VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prestamo (
  id_Reserva INT PRIMARY KEY,
  cod_estado_prestamo INT,
  fecha_inicio DATE,
  fecha_entrega DATE,
  cantidad INT,
  FOREIGN KEY (id_Reserva) REFERENCES Reserva(id_Reserva),
  FOREIGN KEY (cod_estado_prestamo) REFERENCES estado_prestamo(cod_estado_prestamo),
  INDEX idx_cod_estado_prestamo (cod_estado_prestamo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cantidad (
  id_cantidad INT AUTO_INCREMENT PRIMARY KEY,
  id_Reserva INT,
  id_elemento INT,
  codigo VARCHAR(45),
  FOREIGN KEY (id_Reserva) REFERENCES Reserva(id_Reserva),
  FOREIGN KEY (id_elemento) REFERENCES inventario(id_elemento),
  INDEX idx_id_Reserva (id_Reserva),
  INDEX idx_id_elemento (id_elemento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--  VIEWs =====================

CREATE VIEW v_ingreso_login AS
SELECT 
    u.documento,
    u.password,
    u.cod_rol,
    r.cargo AS rol,
    u.cod_estado_usuario,
    eu.estado AS estado_usuario
FROM usuario u
LEFT JOIN rol r ON u.cod_rol = r.cod_rol
LEFT JOIN estado_usuario eu ON u.cod_estado_usuario = eu.cod_estado_usuario;

CREATE VIEW v_usuarios_completos AS
SELECT 
    u.documento,
    u.nombre,
    u.apellido,
    u.cod_rol,
    r.cargo AS rol,
    u.cod_estado_usuario,
    eu.estado AS estado_usuario,
    c.correo,
    t.telefono
FROM usuario u
LEFT JOIN rol r ON u.cod_rol = r.cod_rol
LEFT JOIN estado_usuario eu ON u.cod_estado_usuario = eu.cod_estado_usuario
LEFT JOIN correo c ON u.documento = c.documento
LEFT JOIN telefono t ON u.documento = t.documento;

CREATE VIEW v_historial_prestamos AS
SELECT 
    p.id_Reserva,
    ep.estado AS estado_prestamo,
    p.fecha_inicio,
    p.fecha_entrega,
    r.elemento,
    r.cantidad,
    u.documento,
    u.nombre,
    u.apellido
FROM prestamo p
LEFT JOIN estado_prestamo ep ON p.cod_estado_prestamo = ep.cod_estado_prestamo
LEFT JOIN Reserva r ON p.id_Reserva = r.id_Reserva
LEFT JOIN usuario u ON r.documento = u.documento;

CREATE VIEW v_historial_reservas AS
SELECT 
    r.id_Reserva,
    er.estado AS estado_reserva,
    r.fecha,
    r.plazo,
    r.elemento,
    r.cantidad,
    u.documento,
    u.nombre,
    u.apellido
FROM Reserva r
LEFT JOIN estado_reserva er ON r.Num_estado = er.Num_estado
LEFT JOIN usuario u ON r.documento = u.documento;

--  STORED PROCEDURES =====================

DELIMITER //

CREATE PROCEDURE sp_generar_usuarios()
BEGIN
  DELETE FROM usuario WHERE documento >= 1000000001;
  DELETE FROM correo WHERE documento >= 1000000001;
  DELETE FROM telefono WHERE documento >= 1000000001;

  INSERT INTO usuario (documento, nombre, apellido, cod_rol, cod_estado_usuario, password) VALUES
  (1000000001, 'Carlos', 'López', 1, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000002, 'María', 'González', 1, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000003, 'Pedro', 'Martínez', 1, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000004, 'Ana', 'Sánchez', 1, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000005, 'Jorge', 'Ramírez', 1, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000006, 'Laura', 'Jiménez', 1, 2, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000007, 'Francisco', 'Hernández', 2, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000008, 'Elena', 'Vargas', 2, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000009, 'David', 'Flores', 2, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000010, 'Sofía', 'Gómez', 2, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000011, 'Miguel', 'Fuentes', 3, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa'),
  (1000000012, 'Gabriela', 'Medina', 3, 1, '$2y$12$e4kesmkREXzavpxFafr7re4JRcLoMy6HF/n3YZdxv3SW55VrT0wFa');

  INSERT INTO correo (correo, documento) VALUES
  ('carlos.lopez@gmail.com', 1000000001),
  ('maria.gonzalez@gmail.com', 1000000002),
  ('pedro.martinez@gmail.com', 1000000003),
  ('ana.sanchez@gmail.com', 1000000004),
  ('jorge.ramirez@gmail.com', 1000000005),
  ('laura.jimenez@gmail.com', 1000000006),
  ('francisco.hernandez@gmail.com', 1000000007),
  ('elena.vargas@gmail.com', 1000000008),
  ('david.flores@gmail.com', 1000000009),
  ('sofia.gomez@gmail.com', 1000000010),
  ('miguel.fuentes@gmail.com', 1000000011),
  ('gabriela.medina@gmail.com', 1000000012);

  INSERT INTO telefono (telefono, documento) VALUES
  ('3105551001', 1000000001),
  ('3105551002', 1000000002),
  ('3105551003', 1000000003),
  ('3105551004', 1000000004),
  ('3105551005', 1000000005),
  ('3105551006', 1000000006),
  ('3115551007', 1000000007),
  ('3115551008', 1000000008),
  ('3115551009', 1000000009),
  ('3115551010', 1000000010),
  ('3125551011', 1000000011),
  ('3125551012', 1000000012);
END //

DELIMITER ;

--  Insertar datos iniciales de catálogos =====================

INSERT INTO rol (cod_rol, cargo) VALUES
(1, 'Docente'),
(2, 'Tecnico'),
(3, 'Gerente');

INSERT INTO estado_usuario (cod_estado_usuario, estado) VALUES
(1, 'Activo'),
(2, 'Inactivo'),
(3, 'Bloqueado');

INSERT INTO estado_elemento (cod_estado_elemento, estado) VALUES
(1, 'Disponible'),
(2, 'En uso'),
(3, 'Mantenimiento'),
(4, 'Dañado'),
(5, 'Retirado');

INSERT INTO tipo_elemento (cod_tipo_elemento, tipo) VALUES
(1, 'Computador'),
(2, 'Pantalla'),
(3, 'Proyector'),
(4, 'Accesorio'),
(5, 'Impresora');

INSERT INTO ubi_elemento (cod_ubi_elemento, ubicacion) VALUES
(1, 'Aula 101'),
(2, 'Aula 102'),
(3, 'Laboratorio'),
(4, 'Dirección'),
(5, 'Sala de maestros');

INSERT INTO tipo_mantenimiento (cod_tipo_mantenimiento, tipo) VALUES
(1, 'Preventivo'),
(2, 'Correctivo'),
(3, 'Limpieza');

INSERT INTO estado_reserva (Num_estado, estado) VALUES
(1, 'Pendiente'),
(2, 'Aprobada'),
(3, 'En Proceso'),
(4, 'Cancelada'),
(5, 'Finalizada'),
(6, 'Rechazada');

INSERT INTO estado_prestamo (cod_estado_prestamo, estado) VALUES
(1, 'Solicitado'),
(2, 'Entregado'),
(3, 'Devuelto'),
(4, 'Perdido'),
(5, 'Dañado');

--  Fin del Script =====================
-- Base de datos lista para producción
-- Ejecutar sp_generar_usuarios() para cargar datos de prueba