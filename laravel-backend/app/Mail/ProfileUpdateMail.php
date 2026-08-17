<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProfileUpdateMail extends Mailable
{
    use Queueable, SerializesModels;

    public $nombre;
    public $apellido;
    public $correo;
    public $phone;
    public $rol;

    public function __construct($nombre, $apellido, $correo, $phone, $rol)
    {
        $this->nombre = $nombre;
        $this->apellido = $apellido;
        $this->correo = $correo;
        $this->phone = $phone;
        $this->rol = $rol;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu Perfil ha sido Actualizado - UranusData',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mails.profile-update',
            with: [
                'nombre' => $this->nombre,
                'apellido' => $this->apellido,
                'correo' => $this->correo,
                'phone' => $this->phone,
                'rol' => $this->rol,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}