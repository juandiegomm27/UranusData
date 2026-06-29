const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'usuarios_db.json');

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

// Registrar nuevo usuario
const registrarUsuario = (nuevoUsuario) => {
  const usuarios = leerUsuarios();
  const existe = usuarios.find(u => u.documento === nuevoUsuario.documento);
  
  if (existe) return { error: true, mensaje: 'El documento ya está registrado.' };
  
  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);
  return { success: true };
};

// Validar credenciales de login
const autenticarUsuario = (documento, password, rol) => {
  const usuarios = leerUsuarios();
  return usuarios.find(u => u.documento === documento && u.password === password && u.rol === rol);
};

// ==========================================
// NUEVO: Método para actualizar la contraseña
// ==========================================
const actualizarPassword = (documento, correo, nuevaPassword) => {
  const usuarios = leerUsuarios();
  
  // Buscamos el registro que coincida con el documento y correo
  const indice = usuarios.findIndex(u => u.documento === documento && u.correo === correo);
  
  if (indice === -1) {
    return { error: true, mensaje: 'Los datos ingresados no coinciden con ningún usuario registrado.' };
  }

  // Modificamos la contraseña en la lista
  usuarios[indice].password = nuevaPassword;
  guardarUsuarios(usuarios);
  return { success: true };
};

module.exports = {
  registrarUsuario,
  autenticarUsuario,
  actualizarPassword
};
