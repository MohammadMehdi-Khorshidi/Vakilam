<?php

return [
    'ai' => [
        'provider' => env('VAKILAM_AI_PROVIDER', env('AI_PROVIDER', 'openai')),
        'model' => env('VAKILAM_AI_MODEL'),
        'timeout' => (int) env('VAKILAM_AI_TIMEOUT', 45),
    ],
];
