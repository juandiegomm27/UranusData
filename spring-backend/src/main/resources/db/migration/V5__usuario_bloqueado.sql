INSERT INTO usuario (documento, nombre, apellido, cod_rol, cod_estado_usuario, password)
VALUES ('1000000013', 'Ricardo', 'Peña', 1, 3, crypt('1234567890', gen_salt('bf', 12)));

INSERT INTO correo (correo, documento)
VALUES ('ricardo.pena@gmail.com', '1000000013');

INSERT INTO telefono (telefono, documento)
VALUES ('3125551013', '1000000013');
