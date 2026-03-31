<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

class BrevoMailService
{
    /**
     * Send a transactional email via Laravel's SMTP mailer (Brevo SMTP).
     */
    public function send(string $toEmail, string $toName, string $subject, string $htmlContent): void
    {
        Mail::html($htmlContent, function (Message $message) use ($toEmail, $toName, $subject) {
            $message->to($toEmail, $toName)
                    ->subject($subject)
                    ->from(
                        config('mail.from.address'),
                        config('mail.from.name')
                    );
        });
    }
}
