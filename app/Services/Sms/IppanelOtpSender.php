<?php

namespace App\Services\Sms;

use App\Contracts\OtpSender;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class IppanelOtpSender implements OtpSender
{
    public function send(string $phone, string $code): void
    {
        $apiKey = (string) config('services.ippanel.api_key');
        $baseUrl = rtrim((string) config('services.ippanel.base_url', 'https://edge.ippanel.com/v1/api'), '/');
        $pattern = (string) config('services.ippanel.otp_pattern');
        $from = (string) config('services.ippanel.from');

        if ($apiKey === '' || $pattern === '' || $from === '') {
            throw new RuntimeException('IPPanel credentials or OTP pattern is not configured.');
        }

        $normalizedPhone = $this->normalizePhone($phone);

        // IPPanel Edge pattern send endpoint
        $response = Http::withHeaders([
            'Authorization' => $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])
            ->timeout(15)
            ->post("{$baseUrl}/send", [
                'sending_type' => 'pattern',
                'from_number' => $from,
                'code' => $pattern,
                'recipients' => [$normalizedPhone],
                'params' => [
                    'code' => $code,
                ],
            ]);

        if (! $response->successful()) {
            $message = $response->json('message')
                ?? $response->json('error')
                ?? $response->body()
                ?? 'Unknown IPPanel error';

            throw new RuntimeException(
                'IPPanel rejected the OTP message: '.$message,
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

        if (str_starts_with($phone, '9') && strlen($phone) === 10) {
            return '+98'.$phone;
        }

        return $phone;
    }
}
