const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '', // <-- Tu correo
    pass: '' // <-- Tus 16 letras de Google
  }
});

// Plantilla de bienvenida al activar usuario
const enviarCorreoBienvenida = (nombre, apellidos, rol, destino) => {
  const mailOptions = {
    from: '"Sistema de Gestión SIH" <TU_CORREO_REAL@gmail.com>',
    to: destino,
    subject: 'SIH - ¡Cuenta Activada Exitosamente!',
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1C74A0; text-align: center;">¡Bienvenido al SIH!</h2>
        <p>Hola <strong>${nombre} ${apellidos}</strong>,</p>
        <p>Tu cuenta ha sido activada con éxito bajo el rol de: <strong>${rol}</strong>.</p>
        <br>
        <hr style="border: 0; border-top: 1px solid #eeeeee;">
        <small style="color: #777777; display: block; text-align: center;">Sistema de Información SIH.</small>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error('Error al enviar correo de bienvenida:', error);
    else console.log('Correo de bienvenida enviado:', info.response);
  });
};

// Plantilla de recuperación de clave
const enviarCorreoRecuperacion = (documento, destino) => {
  const mailOptions = {
    from: '"Sistema de Gestión SIH" <TU_CORREO_REAL@gmail.com>',
    to: destino,
    subject: 'SIH - Restablecer tu Contraseña',
    html: `<p>Solicitud de cambio de clave para documento: <strong>${documento}</strong>. Completa el proceso en la web.</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error('Error al enviar correo de recuperación:', error);
    else console.log('Correo de recuperación enviado:', info.response);
  });
};

module.exports = {
  enviarCorreoBienvenida,
  enviarCorreoRecuperacion
};
