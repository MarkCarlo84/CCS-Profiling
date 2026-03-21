<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $role  // 'faculty' or 'student'
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Welcome! Your Account Has Been Created');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.welcome');
    }
}
