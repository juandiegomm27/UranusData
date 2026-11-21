package com.uranusdata.shared.mail;

public class CorreoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public CorreoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
