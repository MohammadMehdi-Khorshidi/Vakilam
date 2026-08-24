<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\FinalLawyerSelectionController;
use App\Http\Controllers\Api\ClientDashboardController;
use App\Http\Controllers\Api\ClientCaseController;
use App\Http\Controllers\Api\LegalRequestController;
use App\Http\Controllers\Api\LegalRequestServiceIntentController;
use App\Http\Controllers\Api\LawyerDirectoryController;
use App\Http\Controllers\Api\LawyerProfileController;
use App\Http\Controllers\Api\LawyerMatchingController;
use App\Http\Controllers\Api\LawyerServiceAreaController;
use App\Http\Controllers\Api\LawyerSpecialtyController;
use App\Http\Controllers\Api\LocationReferenceController;
use App\Http\Controllers\Api\LawyerProposalController;
use App\Http\Controllers\Api\SpecialtyReferenceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth/register')->name('apiRegister.')
    ->controller(RegisterController::class)
    ->group(function () {
        Route::post('/send-otp', 'sendOtp')->middleware('throttle:3,1')->name('sendOtp');
        Route::post('/verify-otp', 'verifyOtp')->middleware('throttle:10,1')->name('verifyOtp');
        Route::post('/', 'store')->middleware('throttle:10,1')->name('store');
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

Route::middleware('auth:sanctum')
    ->controller(ClientDashboardController::class)
    ->group(function () {
        Route::get('/client/dashboard', 'index');
    });

Route::middleware('auth:sanctum')
    ->controller(ClientCaseController::class)
    ->group(function () {
        Route::get('/client/cases/{legalMatter}', 'show');
    });

Route::controller(LocationReferenceController::class)
    ->prefix('reference')
    ->group(function () {
        Route::get('/provinces', 'provinces');
        Route::get('/provinces/{province}/cities', 'cities');
    });

Route::get('/reference/specialties', [SpecialtyReferenceController::class, 'index']);

Route::controller(LawyerDirectoryController::class)->group(function () {
    Route::get('/lawyers', 'index');
    Route::get('/lawyers/{publicId}', 'show');
});

Route::middleware('auth:sanctum')->prefix('lawyer/profile')->group(function () {
    Route::get('/', [LawyerProfileController::class, 'show']);
    Route::patch('/', [LawyerProfileController::class, 'update']);
    Route::put('/specialties', [LawyerSpecialtyController::class, 'update']);
    Route::put('/service-areas', [LawyerServiceAreaController::class, 'update']);
});

Route::middleware('auth:sanctum')->controller(LegalRequestController::class)->group(function () {
    Route::get('/legal-requests', 'index');
    Route::get('/legal-requests/draft', 'draft');
    Route::post('/legal-requests', 'store');
    Route::get('/legal-requests/{legalRequest}', 'show');
    Route::patch('/legal-requests/{legalRequest}', 'update');
    Route::post('/legal-requests/{legalRequest}/submit', 'submit');
});

Route::middleware('auth:sanctum')
    ->controller(LegalRequestServiceIntentController::class)
    ->group(function () {
        Route::get('/legal-requests/{legalRequest}/service-options', 'options');
        Route::post('/legal-requests/{legalRequest}/service-intent', 'store');
    });

Route::middleware('auth:sanctum')
    ->controller(LawyerMatchingController::class)
    ->group(function () {
        Route::post('/legal-requests/{legalRequest}/matching', 'store');
        Route::get('/legal-requests/{legalRequest}/matching', 'show');
        Route::post('/legal-requests/{legalRequest}/lawyer-requests', 'sendRequests');
        Route::get('/legal-requests/{legalRequest}/consultation-lawyers', 'consultationLawyers');
    });

Route::middleware('auth:sanctum')
    ->controller(FinalLawyerSelectionController::class)
    ->group(function () {
        Route::post('/legal-requests/{legalRequest}/lawyer-selection', 'store');
        Route::get('/legal-requests/{legalRequest}/lawyer-selection', 'show');
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
    
Route::middleware('auth:sanctum')
    ->controller(LawyerProposalController::class)
    ->group(function () {
        // Create a new proposal draft for a lawyer distribution.
        Route::post('/lawyer/distributions/{distribution}/proposal', 'store');

        // Update an existing proposal draft.
        Route::patch('/lawyer/proposals/{proposal}', 'update');

        // Submit an existing proposal draft.
        Route::post('/lawyer/proposals/{proposal}/submit', 'submit');
    });
