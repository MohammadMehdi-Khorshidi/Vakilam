<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\LegalRequestController;
use App\Http\Controllers\Api\ReferenceLocationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth/register')->name('apiRegister.')
    ->controller(RegisterController::class)
    ->group(function () {
        Route::post('/send-otp', 'sendOtp')->middleware('throttle:3,1')->name('sendOtp');
        Route::post('/verify-otp', 'verifyOtp')->middleware('throttle:10,1')->name('verifyOtp');
        Route::post('/', 'store')->name('store');
    });

Route::prefix('auth')->name('apiAuth.')
    ->controller(LoginController::class)
    ->group(function () {
        Route::post('/login', 'store')->middleware('throttle:5,1')->name('login');
        Route::post('/logout', 'destroy')->middleware('auth:sanctum')->name('logout');
    });

Route::prefix('auth/password')->name('apiPassword.')
    ->controller(PasswordResetController::class)
    ->group(function () {
        Route::post('/forgot/send-otp', 'sendOtp')->middleware('throttle:3,1')->name('sendOtp');
        Route::post('/forgot/verify-otp', 'verifyOtp')->middleware('throttle:10,1')->name('verifyOtp');
        Route::post('/reset', 'reset')->middleware('throttle:5,1')->name('reset');
    });

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('reference')->name('apiReference.')
    ->controller(ReferenceLocationController::class)
    ->group(function () {
        Route::get('/provinces', 'provinces')->name('provinces');
        Route::get('/provinces/{province}/cities', 'cities')->name('provinceCities');
    });

Route::middleware('auth:sanctum')->controller(LegalRequestController::class)->group(function () {
    Route::post('/legal-requests', 'store');
    Route::post('/legal-requests/{legalRequest}/submit', 'submit');
});

Route::middleware('auth:sanctum')->controller(DocumentController::class)->group(function () {
    Route::prefix('legal-requests/{legalRequest}/documents')->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
    });

    Route::prefix('legal-matters/{legalMatter}/documents')->group(function () {
        Route::get('/', 'indexMatter');
        Route::post('/', 'storeMatter');
    });

    Route::prefix('documents/{document}')->group(function () {
        Route::get('/', 'show');
        Route::get('/download', 'download');
        Route::post('/versions', 'storeVersion');
        Route::delete('/', 'destroy');
    });
});
