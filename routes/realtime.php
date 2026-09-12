<?php

use App\Http\Controllers\Api\LawyerProposalController;
use App\Http\Controllers\Api\RealtimeAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/realtime/config', function (Request $request): array {
    $host = (string) config(
        'broadcasting.connections.reverb.options.host',
        '127.0.0.1',
    );

    if (in_array($host, ['0.0.0.0', '::', 'localhost'], true)) {
        $host = $request->getHost();
    }

    return [
        'key' => (string) config('broadcasting.connections.reverb.key'),
        'host' => $host,
        'port' => (int) config(
            'broadcasting.connections.reverb.options.port',
            8080,
        ),
        'scheme' => (string) config(
            'broadcasting.connections.reverb.options.scheme',
            'http',
        ),
        'auth_endpoint' => url('/api/realtime/auth'),
    ];
});

Route::post(
    '/realtime/auth',
    [RealtimeAuthController::class, 'authorizeChannel'],
);

Route::post(
    '/lawyer/proposals/{proposal:public_id}/reject',
    [LawyerProposalController::class, 'reject'],
);
