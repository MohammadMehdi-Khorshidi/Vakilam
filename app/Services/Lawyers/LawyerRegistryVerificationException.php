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
            'The license number is invalid.',
        );
    }

    public static function phoneMismatch(): self
    {
        return new self(
            'phone',
            'The verified phone number does not match the license record.',
        );
    }
}
