<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NoContactInformation implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || trim($value) === '') {
            return;
        }

        $normalized = strtr($value, [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);

        $patterns = [
            // E-mail addresses.
            '/[a-z0-9._%+\-]+\s*@\s*[a-z0-9.\-]+\.[a-z]{2,}/iu',

            // Explicit URLs and common contact-platform links.
            '/(?:https?:\/\/|www\.)\S+/iu',
            '/(?:t\.me|telegram\.me|wa\.me|whatsapp\.com|instagram\.com)\/?\S*/iu',

            // Social usernames such as @username.
            '/@[a-z0-9_\.]{3,}/iu',

            // Names of common off-platform contact channels.
            '/(?:تلگرام|واتساپ|واتس\s*اپ|اینستاگرام|ایمیل|e-?mail|telegram|whats\s*app|instagram)/iu',

            // Iranian mobile numbers: 09xxxxxxxxx, +989xxxxxxxxx, 00989xxxxxxxxx.
            '/(?<!\d)(?:(?:\+98|0098|98)[\s\-.()]*)?0?9\d(?:[\s\-.()]*\d){8}(?!\d)/u',

            // Iranian fixed/mobile phone-like numbers that start with 0 and include separators.
            '/(?<!\d)0\d(?:[\s\-.()]*\d){8,10}(?!\d)/u',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $normalized) === 1) {
                $fail('ارسال اطلاعات تماس شخصی، لینک یا شناسه شبکه‌های اجتماعی در مذاکره مجاز نیست.');
                return;
            }
        }
    }
}
