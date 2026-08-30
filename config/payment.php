<?php

return [
    /* Shared only with the trusted gateway adapter, never with a browser client. */
    'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET'),
];
