<?php

$frontendUrl = env('FRONTEND_URL');

$origins = array_values(array_unique(array_filter([
    $frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
])));

return [
    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $origins,

    'allowed_origins_patterns' => [
        '#^https?://localhost(?::\d+)?$#',
        '#^https?://127\.0\.0\.1(?::\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
