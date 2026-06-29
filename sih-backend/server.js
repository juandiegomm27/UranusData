const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Permite la conexión segura con Angular

// Configuración del puente de envío (Ejemplo con Gmail)
// NOTA: Para usar Gmail, debes generar una "Contraseña de aplicación" desde tu cuenta de Google
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '', // Reemplaza por correo de donde seba a enviar
    pass: '' // Reemplaza por tu contraseña de aplicación
  }
})

// ENDPOINT: Recuperación de contraseña
app.post('/api/recuperar-contrasena', (req, res) => {
  const { documento, correo } = req.body;

  const mailOptions = {
    from: 'tu_correo_institucional@gmail.com',
    to: correo,
    subject: 'SIH - Restablecer tu Contraseña',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eeeeee; border-radius: 8px;">
        <h2 style="color: #1C74A0;">Restablecer Contraseña</h2>
        <p>Se ha solicitado un cambio de clave para el documento asignado: <strong>${documento}</strong>.</p>
        <p>Para ingresar tu nueva contraseña, por favor completa el formulario en la aplicación web.</p>
        <br>
        <small style="color: #777777;">Si no solicitaste este cambio, puedes ignorar este mensaje de seguridad.</small>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ mensaje: 'No se pudo enviar el correo', error: error.toString() });
    }
    console.log('Correo enviado con éxito:', info.response);
    res.status(200).json({ mensaje: 'Correo despachado con éxito' });
  });
});

// Encendemos el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor Backend corriendo con éxito en http://localhost:3000');
});
