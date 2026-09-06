<?php

namespace App\Services\Lawyers;

use RuntimeException;

class LawyerRegistryVerificationException extends RuntimeException
{
    private function __construct(
        public readonly string $field,
        string $message,
    ) {
        parent::__construct($message);
    }

    public static function invalidLicense(): self
    {
        return new self(
            'license_number',
            'شماره پروانه واردشده معتبر نیست یا در مرجع وکلا پیدا نشد.',
        );
    }

    public static function phoneMismatch(): self
    {
        return new self(
            'phone',
            'شماره موبایل تأییدشده با شماره ثبت‌شده برای این پروانه مطابقت ندارد.',
        );
    }

    public static function nameMismatch(): self
    {
        return new self(
            'first_name',
            'نام و نام خانوادگی واردشده با اطلاعات ثبت‌شده برای این پروانه مطابقت ندارد.',
        );
    }

    public static function licenseAlreadyClaimed(): self
    {
        return new self(
            'license_number',
            'این شماره پروانه قبلاً برای یک حساب کاربری دیگر ثبت شده است.',
        );
    }
}