require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importamos nuestros dos nuevos servicios independientes
const usuariosService = require('./usuarios.service');
const emailService = require('./email.service');

const app = express();
app.use(express.json());
app.use(cors());

// 1. ENDPOINT: Activar / Registrar Usuario
app.post('/api/activar-usuario', async (req, res) => {
  const nuevoUsuario = req.body;
  
  // Delegamos el guardado al servicio de usuarios
  const resultado = usuariosService.registrarUsuario(nuevoUsuario);
  
  if (resultado.error) {
    return res.status(400).json({ status: 'error', mensaje: resultado.mensaje });
  }

  try {
    await emailService.enviarCorreoBienvenida(
      nuevoUsuario.primerNombre, 
      nuevoUsuario.apellidos, 
      nuevoUsuario.rol, 
      nuevoUsuario.correo
    );

    res.status(200).json({ status: 'success', mensaje: 'Usuario activado y guardado.' });
  } catch (error) {
    console.error('Error al enviar correo de bienvenida:', error);
    return res.status(500).json({ status: 'error', mensaje: 'El usuario se guardó, pero no se pudo enviar el correo. Revisa la configuración de Gmail.' });
  }
});

// 2. ENDPOINT: Autenticar / Iniciar Sesión Real
app.post('/api/login', (req, res) => {
  const { documento, password } = req.body;
  
  // Delegamos la búsqueda al servicio de usuarios (detecta el rol automáticamente)
  const usuarioValido = usuariosService.autenticarUsuario(documento, password);

  if (!usuarioValido) {
    return res.status(401).json({ status: 'error', mensaje: 'Credenciales incorrectas o el rol no coincide.' });
  }

  res.status(200).json({ 
    status: 'success', 
    mensaje: 'Acceso concedido', 
    usuario: { documento: usuarioValido.documento, rol: usuarioValido.rol } 
  });
});

// 3. ENDPOINT: Paso 1 - Solicitar enlace de recuperación
app.post('/api/recuperar-contrasena/solicitar', async (req, res) => {
  const { documento, correo } = req.body;

  const resultado = usuariosService.generarTokenRecuperacion(documento, correo);

  if (resultado.error) {
    return res.status(400).json({ status: 'error', mensaje: resultado.mensaje });
  }

  try {
    await emailService.enviarCorreoRecuperacion(documento, correo, resultado.token);
    res.status(200).json({ status: 'success', mensaje: 'Correo de recuperación despachado.' });
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    return res.status(500).json({ status: 'error', mensaje: 'No se pudo enviar el correo de recuperación. Revisa la configuración de Gmail.' });
  }
});

// 4. ENDPOINT: Verificar si un token de recuperación es válido
app.get('/api/recuperar-contrasena/verificar/:token', (req, res) => {
  const { token } = req.params;
  const resultado = usuariosService.verificarToken(token);

  if (!resultado.valido) {
    return res.status(400).json({ status: 'error', mensaje: 'El enlace expiró o no es válido.' });
  }

  res.status(200).json({ status: 'success' });
});

// 5. ENDPOINT: Paso 2 - Confirmar nueva contraseña usando el token
app.post('/api/recuperar-contrasena/confirmar', (req, res) => {
  const { token, password } = req.body;

  const resultado = usuariosService.actualizarPasswordConToken(token, password);

  if (resultado.error) {
    return res.status(400).json({ status: 'error', mensaje: resultado.mensaje });
  }

  res.status(200).json({ status: 'success', mensaje: 'Contraseña actualizada correctamente.' });
});


// NUEVO: SE AGREGA EL ENCENDIDO DEL PUERTO
app.listen(3000, () => {
  console.log('Servidor Backend Modularizado corriendo con éxito en http://localhost:3000');
});
