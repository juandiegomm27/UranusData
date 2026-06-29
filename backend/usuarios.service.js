const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, 'usuarios_db.json');
const SALT_ROUNDS = 10;
const TOKEN_EXPIRACION_MS = 15 * 60 * 1000; // 15 minutos

// Almacenamiento temporal de tokens en memoria { token: { documento, correo, expira } }
const tokensRecuperacion = {};

// Inicializa el archivo si no existe
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

const leerUsuarios = () => {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

const guardarUsuarios = (usuarios) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(usuarios, null, 2));
};

// Registrar nuevo usuario (la contraseña se guarda hasheada)
const registrarUsuario = (nuevoUsuario) => {
  const usuarios = leerUsuarios();
  const existe = usuarios.find(u => u.documento === nuevoUsuario.documento);
  
  if (existe) return { error: true, mensaje: 'El documento ya está registrado.' };
  
  const passwordHasheada = bcrypt.hashSync(nuevoUsuario.password, SALT_ROUNDS);
  
  const usuarioFinal = {
    ...nuevoUsuario,
    password: passwordHasheada
  };
  delete usuarioFinal.verificarPassword;

  usuarios.push(usuarioFinal);
  guardarUsuarios(usuarios);
  return { success: true };
};

// Validar credenciales de login (compara el hash, detecta el rol automáticamente)
const autenticarUsuario = (documento, password) => {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.documento === documento);

  if (!usuario) return null;

  const passwordValida = bcrypt.compareSync(password, usuario.password);
  return passwordValida ? usuario : null;
};

// Genera un token de recuperación si el documento+correo existen
const generarTokenRecuperacion = (documento, correo) => {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.documento === documento && u.correo === correo);

  if (!usuario) {
    return { error: true, mensaje: 'Los datos ingresados no coinciden con ningún usuario registrado.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  tokensRecuperacion[token] = {
    documento,
    correo,
    expira: Date.now() + TOKEN_EXPIRACION_MS
  };

  return { success: true, token };
};

// Verifica si un token es válido (sin consumirlo)
const verificarToken = (token) => {
  const datos = tokensRecuperacion[token];
  if (!datos) return { valido: false };
  if (Date.now() > datos.expira) {
    delete tokensRecuperacion[token];
    return { valido: false };
  }
  return { valido: true };
};

// Actualiza la contraseña usando el token (un solo uso)
const actualizarPasswordConToken = (token, nuevaPassword) => {
  const datos = tokensRecuperacion[token];

  if (!datos || Date.now() > datos.expira) {
    delete tokensRecuperacion[token];
    return { error: true, mensaje: 'El enlace de recuperación expiró o no es válido. Solicita uno nuevo.' };
  }

  const usuarios = leerUsuarios();
  const indice = usuarios.findIndex(u => u.documento === datos.documento && u.correo === datos.correo);

  if (indice === -1) {
    return { error: true, mensaje: 'No se encontró el usuario asociado a este enlace.' };
  }

  usuarios[indice].password = bcrypt.hashSync(nuevaPassword, SALT_ROUNDS);
  guardarUsuarios(usuarios);

  delete tokensRecuperacion[token]; // un solo uso
  return { success: true };
};

module.exports = {
  registrarUsuario,
  autenticarUsuario,
  generarTokenRecuperacion,
  verificarToken,
  actualizarPasswordConToken
};