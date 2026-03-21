<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $otp,
        public string $action
    ) {}

    public function envelope(): Envelope
    {
        $subject = match($this->action) {
            'add_faculty'  => 'OTP: Confirm Add Faculty',
            'add_student'  => 'OTP: Confirm Add Student',
            'first_login'  => 'OTP: Verify Your New Account',
            default        => 'OTP: Verify Your Email',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.otp');
    }
}
