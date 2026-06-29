const express = require('express');
const cors = require('cors');

// Importamos nuestros dos nuevos servicios independientes
const usuariosService = require('./usuarios.service');
const emailService = require('./email.service');

const app = express();
app.use(express.json());
app.use(cors());

// 1. ENDPOINT: Activar / Registrar Usuario
app.post('/api/activar-usuario', (req, res) => {
  const nuevoUsuario = req.body;
  
  // Delegamos el guardado al servicio de usuarios
  const resultado = usuariosService.registrarUsuario(nuevoUsuario);
  
  if (resultado.error) {
    return res.status(400).json({ status: 'error', mensaje: resultado.mensaje });
  }

  // Delegamos el despacho del correo al servicio de email
  emailService.enviarCorreoBienvenida(
    nuevoUsuario.primerNombre, 
    nuevoUsuario.apellidos, 
    nuevoUsuario.rol, 
    nuevoUsuario.correo
  );

  res.status(200).json({ status: 'success', mensaje: 'Usuario activado y guardado.' });
});

// 2. ENDPOINT: Autenticar / Iniciar Sesión Real
app.post('/api/login', (req, res) => {
  const { documento, password, rol } = req.body;
  
  // Delegamos la búsqueda al servicio de usuarios
  const usuarioValido = usuariosService.autenticarUsuario(documento, password, rol);

  if (!usuarioValido) {
    return res.status(401).json({ status: 'error', mensaje: 'Credenciales incorrectas o el rol no coincide.' });
  }

  res.status(200).json({ 
    status: 'success', 
    mensaje: 'Acceso concedido', 
    usuario: { documento: usuarioValido.documento, rol: usuarioValido.rol } 
  });
});

// 3. ENDPOINT: Recuperar / Restablecer Contraseña Real
app.post('/api/recuperar-contrasena', (req, res) => {
  const { documento, correo, password } = req.body;
  
  // SI VIENE PASSWORD: Significa que el usuario está en el Paso 2 mandando su nueva clave
  if (password) {
    const resultado = usuariosService.actualizarPassword(documento, correo, password);
    
    if (resultado.error) {
      return res.status(400).json({ status: 'error', mensaje: resultado.mensaje });
    }
    
    console.log(`¡Contraseña actualizada con éxito en la BD para el documento: ${documento}!`);
    return res.status(200).json({ status: 'success', mensaje: 'Contraseña actualizada correctamente.' });
  }

  // SI NO VIENE PASSWORD: Significa que está en el Paso 1 y solo quiere despachar el correo
  emailService.enviarCorreoRecuperacion(documento, correo);
  res.status(200).json({ status: 'success', mensaje: 'Correo de recuperación despachado.' });
});

// ==========================================
// NUEVO: SE AGREGA EL ENCENDIDO DEL PUERTO
// ==========================================
app.listen(3000, () => {
  console.log('Servidor Backend Modularizado corriendo con éxito en http://localhost:3000');
});
