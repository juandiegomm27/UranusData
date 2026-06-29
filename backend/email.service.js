const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER?.trim(),
    pass: process.env.GMAIL_APP_PASSWORD?.trim()
  },
  secure: true
});

// Plantilla de bienvenida al activar usuario
const enviarCorreoBienvenida = async (nombre, apellidos, rol, destino) => {
  const mailOptions = {
    from: `"Sistema de Gestión" <${process.env.GMAIL_USER}>`,
    to: destino,
    subject: '¡Cuenta Activada Exitosamente!',
    html: `
      <div style="
      font-family: sans-serif; 
      padding: 20px; 
      max-width: 500px; 
      margin: 0 auto; 
      border: 1px solid #e0e0e0; 
      border-radius: 8px;
      ">

        <h2 style="
        color: #1C74A0; 
        text-align: center;
        ">

        ¡Bienvenido a UranusData!
        
        </h2>
        <p>
        
        Hola <strong>${nombre} ${apellidos}</strong>,
        
        </p>
        <p>
        
        Tu cuenta ha sido activada con éxito bajo el rol de: <strong>${rol}</strong>.
        
        </p>
        <br>
        <hr style="
        border: 0; 
        border-top: 1px solid #eeeeee;
        ">
        <small style="
        color: #777777; 
        display: block; 
        text-align: center;
        ">
        Sistema de Información UranusData.
        </small>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

// Plantilla de recuperación de clave con enlace único
const enviarCorreoRecuperacion = async (documento, destino, token) => {
  const enlace = `http://localhost:4200/recuperar-contrasena/${token}`;

  const mailOptions = {
    from: `"Sistema de Gestión SIH" <${process.env.GMAIL_USER}>`,
    to: destino,
    subject: 'UranusData - Restablecer tu Contraseña',
    html: `
      <div style="
      font-family: sans-serif; 
      padding: 20px; 
      max-width: 500px;
      margin: 0 auto;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      ">
        <h2 style="
        color: #1C74A0; 
        text-align: center;
        ">

        Restablecer Contraseña
        
        </h2>
        <p>
        
        Solicitud de cambio de clave para el documento: <strong>${documento}</strong>.
        
        </p>
        <p>
        
        Haz clic en el siguiente enlace para continuar (válido por 15 minutos):
        
        </p>
        <p style="
        text-align: center; 
        margin: 25px 0;
        ">
          <a href="${enlace}" style="
          background-color: #1C74A0; 
          color: #ffffff; 
          padding: 12px 24px; 
          border-radius: 6px; 
          text-decoration: none; 
          font-weight: 600;">

          Restablecer mi contraseña

          </a>
        </p>
        <p style="
        font-size: 12px;
        color: #777777;
        ">

         Si no solicitaste esto, ignora este correo.
         
         </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  enviarCorreoBienvenida,
  enviarCorreoRecuperacion
};
