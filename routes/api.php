<?php

use App\Http\Controllers\Api\Auth\RegisterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth/register')
    ->name('api.register.')
    ->controller(RegisterController::class)
    ->group(function () {
        Route::post('/send-otp', 'sendOtp')
            ->middleware('throttle:3,1')
            ->name('send-otp');

        Route::post('/verify-otp', 'verifyOtp')
            ->middleware('throttle:10,1')
            ->name('verify-otp');

        Route::post('/', 'store')
            ->name('store');
    });

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
