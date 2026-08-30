<?php

return [
    'path' => env('LAWYER_REGISTRY_PATH')
        ?: storage_path('app/private/lawyers.json'),

    // Leave records_key null when the JSON root is an array. A common
    // alternative is "data" when records are wrapped in an object.
    'records_key' => env('LAWYER_REGISTRY_RECORDS_KEY'),
    'license_key' => env('LAWYER_REGISTRY_LICENSE_KEY', 'license_number'),
    'phone_key' => env('LAWYER_REGISTRY_PHONE_KEY', 'phone'),
    'organization_key' => env(
        'LAWYER_REGISTRY_ORGANIZATION_KEY',
        'organization',
    ),
];
