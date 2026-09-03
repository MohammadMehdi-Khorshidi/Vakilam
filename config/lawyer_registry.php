<?php

$resolveProjectPath = static function (?string $path, string $fallback): string {
    $path = trim((string) $path);

    if ($path === '') {
        return $fallback;
    }

    $isAbsolute = str_starts_with($path, '/')
        || str_starts_with($path, '\\\\')
        || preg_match('/^[A-Za-z]:[\\\\\/]/', $path) === 1;

    return $isAbsolute ? $path : base_path($path);
};

return [
    // Private registry used only to validate lawyer sign-up. These records are
    // reference data and must not be imported into users/lawyer_profiles.
    'path' => $resolveProjectPath(
        env('LAWYER_REGISTRY_PATH'),
        storage_path('app/private/lawyer-registry/lawyers_final.json'),
    ),

    // Supplemental office/location registry. Kept separate from service areas:
    // a registry office location does not automatically mean the lawyer serves
    // the whole province/city for matching purposes.
    'locations_path' => $resolveProjectPath(
        env('LAWYER_REGISTRY_LOCATIONS_PATH'),
        storage_path('app/private/lawyer-registry/lawyer_locations_final.json'),
    ),

    // Leave records_key null when the JSON root is an array.
    'records_key' => env('LAWYER_REGISTRY_RECORDS_KEY'),
    'license_key' => env('LAWYER_REGISTRY_LICENSE_KEY', 'license_number'),
    'phone_key' => env('LAWYER_REGISTRY_PHONE_KEY', 'mobile'),
    'name_key' => env('LAWYER_REGISTRY_NAME_KEY', 'full_name'),
    'organization_key' => env(
        'LAWYER_REGISTRY_ORGANIZATION_KEY',
        'organization',
    ),
];
