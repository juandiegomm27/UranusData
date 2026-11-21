package com.uranusdata.shared.mail;

import jakarta.mail.internet.MimeMessage;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class CorreoService {

    private static final Locale ESPANOL = Locale.forLanguageTag("es-CO");

    private final JavaMailSender remitenteMail;
    private final ITemplateEngine plantillas;
    private final String remitente;

    public CorreoService(JavaMailSender remitenteMail, ITemplateEngine plantillas,
                         @Value("${app.mail-from}") String remitente) {
        this.remitenteMail = remitenteMail;
        this.plantillas = plantillas;
        this.remitente = remitente;
    }

    /**
     * @param plantilla ruta sin extension bajo src/main/resources/templates,
     *                  por ejemplo "correo/recuperar-contrasena"
     */
    public void enviarHtml(String destinatario, String asunto, String plantilla, Map<String, Object> variables) {
        try {
            Context contexto = new Context(ESPANOL);
            contexto.setVariables(variables);
            String html = plantillas.process(plantilla, contexto);

            MimeMessage mensaje = remitenteMail.createMimeMessage();
            MimeMessageHelper ayudante = new MimeMessageHelper(mensaje, true, "UTF-8");
            ayudante.setFrom(remitente);
            ayudante.setTo(destinatario);
            ayudante.setSubject(asunto);
            ayudante.setText(html, true);

            remitenteMail.send(mensaje);
        } catch (Exception e) {
            // Se captura Exception a proposito: este metodo es la frontera con JavaMail
            // y Thymeleaf, y cualquier fallo suyo significa lo mismo para quien llama.
            // La causa original viaja dentro para que quede en el log.
            throw new CorreoException("No se pudo enviar el correo con la plantilla " + plantilla, e);
        }
    }
}
