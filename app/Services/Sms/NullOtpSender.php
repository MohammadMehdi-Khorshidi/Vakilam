<?php

namespace App\Services\Sms;

use App\Contracts\OtpSender;
use Illuminate\Support\Facades\Log;

class NullOtpSender implements OtpSender
{
    public function send(string $phone, string $code): void
    {
        // Never expose OTPs in production logs. This sender is intentionally
        // useful only for local development and automated tests.
        if (app()->environment(['local', 'testing'])) {
            Log::debug('Local OTP generated.', [
                'phone' => $phone,
                'otp' => $code,
            ]);
        }
    }
}
