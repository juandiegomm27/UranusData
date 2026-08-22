<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject_text;
    public $template;
    public $data;

    public function __construct($template, $data = [])
    {
        $this->template = $template;
        $this->data = $data;
        $this->subject_text = $data['subject'] ?? 'Notificación de UranusData';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject_text,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mails.' . $this->template,
            with: $this->data,
        );
    }

    public function attachments(): array
    {
        return [];
    }
}