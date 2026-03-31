<?php

namespace App\Services;

use SendinBlue\Client\Configuration;
use SendinBlue\Client\Api\TransactionalEmailsApi;
use SendinBlue\Client\Model\SendSmtpEmail;
use SendinBlue\Client\Model\SendSmtpEmailTo;
use SendinBlue\Client\Model\SendSmtpEmailSender;
use GuzzleHttp\Client;

class BrevoMailService
{
    protected TransactionalEmailsApi $api;

    public function __construct()
    {
        $config = Configuration::getDefaultConfiguration()
            ->setApiKey('api-key', config('services.brevo.api_key'));

        $this->api = new TransactionalEmailsApi(new Client(), $config);
    }

    /**
     * Send a transactional email via the Brevo HTTP API.
     *
     * @param  string  $toEmail
     * @param  string  $toName
     * @param  string  $subject
     * @param  string  $htmlContent
     * @return void
     */
    public function send(string $toEmail, string $toName, string $subject, string $htmlContent): void
    {
        $sender = new SendSmtpEmailSender([
            'email' => config('mail.from.address'),
            'name'  => config('mail.from.name'),
        ]);

        $to = new SendSmtpEmailTo([
            'email' => $toEmail,
            'name'  => $toName,
        ]);

        $email = new SendSmtpEmail([
            'sender'      => $sender,
            'to'          => [$to],
            'subject'     => $subject,
            'htmlContent' => $htmlContent,
        ]);

        $this->api->sendTransacEmail($email);
    }
}
