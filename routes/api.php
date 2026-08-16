<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
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
})->middleware('auth:sanctum');

//login and logout
Route::prefix('auth')
    ->name('api.auth.')
    ->controller(LoginController::class)
    ->group(function () {
        Route::post('/login', 'store')
            ->middleware('throttle:5,1')
            ->name('login');

        Route::post('/logout', 'destroy')
            ->middleware('auth:sanctum')
            ->name('logout');
    });

//password reset
Route::prefix('auth/password')
    ->name('api.password.')
    ->controller(PasswordResetController::class)
    ->group(function () {
        Route::post('/forgot/send-otp', 'sendOtp')
            ->middleware('throttle:3,1')
            ->name('send-otp');

        Route::post('/forgot/verify-otp', 'verifyOtp')
            ->middleware('throttle:10,1')
            ->name('verify-otp');

        Route::post('/reset', 'reset')
            ->middleware('throttle:5,1')
            ->name('reset');
    });

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
