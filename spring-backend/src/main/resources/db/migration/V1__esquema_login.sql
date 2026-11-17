-- CATÁLOGOS
CREATE TABLE rol (
    cod_rol INTEGER PRIMARY KEY,
    cargo   VARCHAR(45) NOT NULL UNIQUE
);

CREATE TABLE estado_usuario (
    cod_estado_usuario INTEGER PRIMARY KEY,
    estado             VARCHAR(45) NOT NULL UNIQUE
);

INSERT INTO rol (cod_rol, cargo) VALUES
    (1, 'Docente'),
    (2, 'Tecnico'),
    (3, 'Gerente');

INSERT INTO estado_usuario (cod_estado_usuario, estado) VALUES
    (1, 'Activo'),
    (2, 'Inactivo'),
    (3, 'Bloqueado');

-- USUARIOS
CREATE TABLE usuario (
    documento          VARCHAR(20) PRIMARY KEY,
    nombre             VARCHAR(45)  NOT NULL,
    apellido           VARCHAR(45)  NOT NULL,
    cod_rol            INTEGER      NOT NULL REFERENCES rol (cod_rol),
    cod_estado_usuario INTEGER      NOT NULL DEFAULT 1 REFERENCES estado_usuario (cod_estado_usuario),
    password           VARCHAR(255) NOT NULL
);

CREATE INDEX idx_usuario_rol    ON usuario (cod_rol);
CREATE INDEX idx_usuario_estado ON usuario (cod_estado_usuario);

CREATE TABLE correo (
    correo    VARCHAR(100) PRIMARY KEY,
    documento VARCHAR(20)  NOT NULL
        REFERENCES usuario (documento) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX idx_correo_documento ON correo (documento);

CREATE TABLE telefono (
    telefono  VARCHAR(20) PRIMARY KEY,
    documento VARCHAR(20) NOT NULL
        REFERENCES usuario (documento) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX idx_telefono_documento ON telefono (documento);

-- RECUPERACIÓN DE CONTRASEÑA (se guarda el hash SHA-256 del token, no el token)
CREATE TABLE password_reset_tokens (
    documento  VARCHAR(20) PRIMARY KEY
        REFERENCES usuario (documento) ON UPDATE CASCADE ON DELETE CASCADE,
    token_hash CHAR(64)    NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);