<?php

namespace App\Services\Negotiations;

class ContactInformationDetector
{
    public function containsContactInformation(string $value): bool
    {
        $normalized = strtr($value, [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);

        foreach ([
            '/(?:\+?98|0098|0)?9\d{9}/',
            '/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i',
            '/(?:https?:\/\/|www\.|wa\.me\/|t\.me\/)[^\s]+/i',
            '/(?<![\w.])@[A-Z0-9_]{4,}/i',
        ] as $pattern) {
            if (preg_match($pattern, $normalized) === 1) {
                return true;
            }
        }

        return false;
    }
}
