<?php

namespace App\Services\Sms;

use App\Contracts\OtpSender;
use Ippanel\Client;
use RuntimeException;

class IppanelOtpSender implements OtpSender
{
    public function __construct(
        private readonly Client $client,
    ) {
    }

    public function send(string $phone, string $code): void
    {
        $pattern = (string) config('services.ippanel.otp_pattern');
        $from = (string) config('services.ippanel.from');

        if ($pattern === '' || $from === '') {
            throw new RuntimeException('IPPanel sender or OTP pattern is not configured.');
        }

        $response = $this->client->sendPattern(
            $pattern,
            $from,
            $this->normalizePhone($phone),
            ['code' => $code],
        );

        if (! $response->isSuccessful()) {
            throw new RuntimeException(
                'IPPanel rejected the OTP message: '.$response->getMessage(),
            );
        }
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\D+/', '', $phone) ?? '';

        if (str_starts_with($phone, '09')) {
            return '+98'.substr($phone, 1);
        }

        if (str_starts_with($phone, '98')) {
            return '+'.$phone;
        }

        return $phone;
    }
}
