<?php

namespace App\Services\Lawyers;

use App\Exceptions\LawyerRegistryUnavailableException;
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

        $licenseFound = false;
        $matchedRecord = null;

        foreach ($this->records() as $record) {
            $recordLicense = $this->normalizeLicenseNumber((string) $this->recordValue(
                $record,
                (string) config('lawyer_registry.license_key'),
                ['license_number', 'license_no', 'شماره پروانه'],
            ));

            if ($recordLicense === '' || ! hash_equals($normalizedLicense, $recordLicense)) {
                continue;
            }

            $licenseFound = true;
            $recordPhone = $this->normalizePhone((string) $this->recordValue(
                $record,
                (string) config('lawyer_registry.phone_key'),
                ['phone', 'mobile', 'mobile_number', 'شماره موبایل'],
            ));

            if ($matchedRecord === null && hash_equals($normalizedPhone, $recordPhone)) {
                $matchedRecord = $record;
            }
        }

        if (! $licenseFound) {
            throw LawyerRegistryVerificationException::invalidLicense();
        }

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

    /** @return iterable<int, array<string, mixed>> */
    private function records(): iterable
    {
        $path = $this->registryPath();
        $recordsKey = config('lawyer_registry.records_key');

        if (is_string($recordsKey) && $recordsKey !== '') {
            yield from $this->decodedRecords($path, $recordsKey);

            return;
        }

        yield from $this->streamArrayRecords($path);
    }

    private function registryPath(): string
    {
        $configuredPath = trim((string) config('lawyer_registry.path'));
        $defaultPath = storage_path(
            'app/private/lawyer-registry/lawyers_final.json',
        );
        $checkedPaths = [];

        foreach (array_unique([$configuredPath, $defaultPath]) as $path) {
            if ($path === '') {
                continue;
            }

            $resolvedPath = $this->absolutePath($path);
            $checkedPaths[] = $resolvedPath;

            if (is_file($resolvedPath) && is_readable($resolvedPath)) {
                return $resolvedPath;
            }
        }

        throw new LawyerRegistryUnavailableException(
            'The lawyer registry file is unavailable. Checked: '.implode(', ', $checkedPaths),
        );
    }

    private function absolutePath(string $path): string
    {
        $isAbsolute = str_starts_with($path, '/')
            || str_starts_with($path, '\\\\')
            || preg_match('/^[A-Za-z]:[\\\\\/]/', $path) === 1;

        return $isAbsolute ? $path : base_path($path);
    }

    /** @return iterable<int, array<string, mixed>> */
    private function decodedRecords(string $path, string $recordsKey): iterable
    {
        try {
            $contents = file_get_contents($path);

            if ($contents === false) {
                throw new LawyerRegistryUnavailableException(
                    'The lawyer registry file could not be read: '.$path,
                );
            }

            $decoded = json_decode(
                $contents,
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

        $records = data_get($decoded, $recordsKey);

        if (! is_array($records) || ! array_is_list($records)) {
            throw new LawyerRegistryUnavailableException(
                'The lawyer registry records are invalid.',
            );
        }

        foreach ($records as $record) {
            if (is_array($record)) {
                yield $record;
            }
        }
    }

    /**
     * Read a root JSON array one record at a time. The production registry is
     * large enough that decoding it into one PHP array can exhaust PHP memory.
     *
     * @return iterable<int, array<string, mixed>>
     */
    private function streamArrayRecords(string $path): iterable
    {
        $handle = @fopen($path, 'rb');

        if ($handle === false) {
            throw new LawyerRegistryUnavailableException(
                'The lawyer registry file could not be opened: '.$path,
            );
        }

        $started = false;
        $finished = false;
        $firstChunk = true;
        $outerState = 'value_or_end';
        $buffer = '';
        $depth = 0;
        $inString = false;
        $escaped = false;

        try {
            while (! feof($handle)) {
                $chunk = fread($handle, 65536);

                if ($chunk === false) {
                    throw new LawyerRegistryUnavailableException(
                        'The lawyer registry file could not be read: '.$path,
                    );
                }

                if ($firstChunk) {
                    $chunk = preg_replace('/^\xEF\xBB\xBF/', '', $chunk) ?? $chunk;
                    $firstChunk = false;
                }

                $length = strlen($chunk);

                for ($index = 0; $index < $length; $index++) {
                    $character = $chunk[$index];

                    if ($depth === 0) {
                        if (ctype_space($character)) {
                            continue;
                        }

                        if (! $started) {
                            if ($character !== '[') {
                                throw new LawyerRegistryUnavailableException(
                                    'The lawyer registry JSON root must be an array.',
                                );
                            }

                            $started = true;
                            continue;
                        }

                        if ($finished) {
                            throw new LawyerRegistryUnavailableException(
                                'The lawyer registry JSON has trailing content.',
                            );
                        }

                        if ($outerState === 'comma_or_end') {
                            if ($character === ',') {
                                $outerState = 'value';
                                continue;
                            }

                            if ($character === ']') {
                                $finished = true;
                                continue;
                            }

                            throw new LawyerRegistryUnavailableException(
                                'The lawyer registry JSON has an invalid record separator.',
                            );
                        }

                        if ($character === ']' && $outerState === 'value_or_end') {
                            $finished = true;
                            continue;
                        }

                        if ($character !== '{') {
                            throw new LawyerRegistryUnavailableException(
                                'The lawyer registry must contain JSON objects.',
                            );
                        }

                        $buffer = '{';
                        $depth = 1;
                        $inString = false;
                        $escaped = false;

                        continue;
                    }

                    $buffer .= $character;

                    if ($inString) {
                        if ($escaped) {
                            $escaped = false;
                        } elseif ($character === '\\') {
                            $escaped = true;
                        } elseif ($character === '"') {
                            $inString = false;
                        }

                        continue;
                    }

                    if ($character === '"') {
                        $inString = true;
                    } elseif ($character === '{' || $character === '[') {
                        $depth++;
                    } elseif ($character === '}' || $character === ']') {
                        $depth--;
                    }

                    if ($depth !== 0) {
                        continue;
                    }

                    try {
                        $record = json_decode(
                            $buffer,
                            true,
                            512,
                            JSON_THROW_ON_ERROR,
                        );
                    } catch (JsonException $exception) {
                        throw new LawyerRegistryUnavailableException(
                            'The lawyer registry contains an invalid JSON record.',
                            previous: $exception,
                        );
                    }

                    if (! is_array($record)) {
                        throw new LawyerRegistryUnavailableException(
                            'The lawyer registry contains a non-object record.',
                        );
                    }

                    $buffer = '';
                    $outerState = 'comma_or_end';

                    yield $record;
                }
            }

            if (! $started || ! $finished || $depth !== 0 || $inString) {
                throw new LawyerRegistryUnavailableException(
                    'The lawyer registry JSON is incomplete.',
                );
            }
        } finally {
            fclose($handle);
        }
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
