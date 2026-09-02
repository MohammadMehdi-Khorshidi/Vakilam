<?php

namespace App\Services\Sms;

use App\Contracts\OtpSender;

class NullOtpSender implements OtpSender
{
    public function send(string $phone, string $code): void
    {
        // Automated tests must not call the external SMS provider.
    }
}
