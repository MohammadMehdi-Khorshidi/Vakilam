<?php

namespace App\Services\Lawyers;

use App\Exceptions\LawyerRegistryUnavailableException;
use Illuminate\Support\Arr;
use JsonException;

class LawyerRegistryVerifier
{
    /**
     * @return array{license_number: string, full_name: string, organization: mixed, source_hash: string}
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

        $records = $this->records();

        $licenseMatches = array_values(array_filter(
            $records,
            function (array $record) use ($normalizedLicense): bool {
                $recordLicense = $this->normalizeLicenseNumber((string) $this->recordValue(
                    $record,
                    (string) config('lawyer_registry.license_key'),
                    ['license_number', 'license_no', 'شماره پروانه'],
                ));

                return $recordLicense !== ''
                    && hash_equals($normalizedLicense, $recordLicense);
            },
        ));

        if ($licenseMatches === []) {
            throw LawyerRegistryVerificationException::invalidLicense();
        }

        $matchedRecord = Arr::first(
            $licenseMatches,
            fn (array $record): bool => hash_equals(
                $normalizedPhone,
                $this->normalizePhone((string) $this->recordValue(
                    $record,
                    (string) config('lawyer_registry.phone_key'),
                    ['phone', 'mobile', 'mobile_number', 'شماره موبایل'],
                )),
            ),
        );

        if (! is_array($matchedRecord)) {
            throw LawyerRegistryVerificationException::phoneMismatch();
        }

        $registryFullName = (string) $this->recordValue(
            $matchedRecord,
            (string) config('lawyer_registry.name_key'),
            ['full_name', 'name', 'lawyer_name', 'نام و نام خانوادگی', 'نام'],
        );

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
            'organization' => $this->recordValue(
                $matchedRecord,
                (string) config('lawyer_registry.organization_key'),
                ['organization', 'issuer', 'organization_name', 'نام سازمان'],
            ),
            'source_hash' => hash('sha256', json_encode(
                $matchedRecord,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
            ) ?: ''),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function records(): array
    {
        $path = (string) config('lawyer_registry.path');

        if ($path === '' || ! is_file($path) || ! is_readable($path)) {
            throw new LawyerRegistryUnavailableException(
                'The lawyer registry file is unavailable.',
            );
        }

        try {
            $decoded = json_decode(
                (string) file_get_contents($path),
                true,
                512,
                JSON_THROW_ON_ERROR,
            );
        } catch (JsonException $exception) {
            throw new LawyerRegistryUnavailableException(
                'The lawyer registry file is invalid.',
                previous: $exception,
            );
        }

        $recordsKey = config('lawyer_registry.records_key');
        $records = is_string($recordsKey) && $recordsKey !== ''
            ? data_get($decoded, $recordsKey)
            : $decoded;

        if (! is_array($records) || ! array_is_list($records)) {
            throw new LawyerRegistryUnavailableException(
                'The lawyer registry records are invalid.',
            );
        }

        return array_values(array_filter(
            $records,
            fn (mixed $record): bool => is_array($record),
        ));
    }

    /**
     * @param array<string, mixed> $record
     * @param array<int, string> $fallbackKeys
     */
    private function recordValue(
        array $record,
        string $configuredKey,
        array $fallbackKeys,
    ): mixed {
        foreach (array_unique([$configuredKey, ...$fallbackKeys]) as $key) {
            if ($key !== '' && data_get($record, $key) !== null) {
                return data_get($record, $key);
            }
        }

        return null;
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
