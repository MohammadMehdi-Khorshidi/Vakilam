<?php

namespace App\Services\Lawyers;

use App\Exceptions\LawyerRegistryUnavailableException;
use App\Models\LawyerProfile;
use Illuminate\Database\Eloquent\Builder;
use Throwable;

class LawyerRegistryVerifier
{
    /**
     * Confirmed against lawyer_profiles.sql (real schema).
     */
    private const LICENSE_COLUMN = 'license_number';
    private const NAME_COLUMN = 'full_name';
    private const MOBILE_PHONE_COLUMN = 'mobile';
    private const OFFICE_PHONE_COLUMN = 'office_phone';
    private const IMPORTED_AT_COLUMN = 'imported_at';

    /**
     * @return array{license_number: string, full_name: string, organization: mixed, source_hash: string, lawyer_profile_id: string}
     */
    public function verify(
        string $licenseNumber,
        string $verifiedPhone,
        string $providedFullName,
    ): array
    {
        $normalizedLicense = $this->normalizeLicenseNumber($licenseNumber);
        $normalizedPhone = $this->normalizePhone($verifiedPhone);
        $normalizedFullName = $this->normalizePersonName($providedFullName);

        if ($normalizedLicense === '') {
            throw LawyerRegistryVerificationException::invalidLicense();
        }

        $record = $this->findByLicenseNumber($normalizedLicense);

        if ($record === null) {
            throw LawyerRegistryVerificationException::invalidLicense();
        }

        if ($record->{self::IMPORTED_AT_COLUMN} === null) {
            // No imported_at means this row is no longer a raw import
            // placeholder -- it was already claimed by a real registered
            // account (user_id is NOT NULL/unique in this schema, so it
            // can't be used as the "unclaimed" signal on its own).
            throw LawyerRegistryVerificationException::licenseAlreadyClaimed();
        }

        $recordPhone = $this->normalizePhone((string) $record->{self::MOBILE_PHONE_COLUMN});

        if (! hash_equals($normalizedPhone, $recordPhone)) {
            throw LawyerRegistryVerificationException::phoneMismatch();
        }

        $registryFullName = (string) $record->{self::NAME_COLUMN};

        if (
            $normalizedFullName === ''
            || $this->normalizePersonName($registryFullName) === ''
            || ! hash_equals(
                $this->normalizePersonName($registryFullName),
                $normalizedFullName,
            )
        ) {
            throw LawyerRegistryVerificationException::nameMismatch();
        }

        return [
            'license_number' => $normalizedLicense,
            'full_name' => trim($registryFullName),
            'organization' => null, // wire this up if/when you add an organization column
            'source_hash' => hash('sha256', $record->id . '|' . $normalizedLicense),
            'lawyer_profile_id' => $record->id,
        ];
    }

    private function findByLicenseNumber(string $normalizedLicense): ?LawyerProfile
    {
        try {
            /** @var LawyerProfile|null $record */
            $record = LawyerProfile::query()
                ->select(['id', 'user_id', self::LICENSE_COLUMN, self::NAME_COLUMN, self::MOBILE_PHONE_COLUMN, self::IMPORTED_AT_COLUMN])
                ->where(function (Builder $query) use ($normalizedLicense): void {
                    // Strips the same separators normalizeLicenseNumber() strips, so
                    // "12345", "123-45" and "123 45" in the DB all match the same input.
                    $query->whereRaw(
                        "REPLACE(REPLACE(REPLACE(REPLACE(`" . self::LICENSE_COLUMN . "`, ' ', ''), '-', ''), '/', ''), '_', '') = ?",
                        [$normalizedLicense],
                    );
                })
                ->first();
        } catch (Throwable $exception) {
            // A DB outage/misconfiguration should surface the same "temporarily
            // unavailable" response the controller already knows how to handle,
            // instead of a raw 500.
            throw new LawyerRegistryUnavailableException(
                'The lawyer registry table could not be queried.',
                previous: $exception,
            );
        }

        return $record;
    }

    private function normalizeLicenseNumber(string $licenseNumber): string
    {
        $licenseNumber = $this->toEnglishDigits(trim($licenseNumber));

        return (string) preg_replace('/[\s\-\/_]+/u', '', $licenseNumber);
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace(
            '/\D+/u',
            '',
            $this->toEnglishDigits($phone),
        ) ?? '';

        if (str_starts_with($phone, '0098')) {
            $phone = substr($phone, 4);
        } elseif (str_starts_with($phone, '98')) {
            $phone = substr($phone, 2);
        }

        if (strlen($phone) === 10 && str_starts_with($phone, '9')) {
            $phone = '0'.$phone;
        }

        return $phone;
    }

    private function normalizePersonName(string $name): string
    {
        $name = strtr($name, [
            'ي' => 'ی',
            'ى' => 'ی',
            'ك' => 'ک',
            '‌' => ' ',
            '‏' => '',
            '‎' => '',
        ]);

        $name = preg_replace('/[\x{064B}-\x{065F}\x{0670}]/u', '', $name) ?? $name;
        $name = mb_strtolower(trim($name), 'UTF-8');

        // Spaces, half-spaces and common separators should not make an
        // otherwise identical Persian name fail registry verification.
        return (string) preg_replace('/[\s\-‐‑‒–—_]+/u', '', $name);
    }

    private function toEnglishDigits(string $value): string
    {
        return strtr($value, [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);
    }
}