<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Resources\AuthenticatedUserResource;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EngagementController;
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
use App\Http\Controllers\Api\LawyerAvailabilityController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\NegotiationController;
use App\Http\Controllers\Api\LawyerInterestController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\LawyerSelectionController;
use App\Http\Controllers\Api\LawyerWorkspaceController;
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

Route::middleware(['auth:sanctum', 'active'])->get('/user', function (Request $request) {
    $user = $request->user()->load(['roles:id,code,name', 'clientProfile', 'lawyerProfile']);

    return response()->json(AuthenticatedUserResource::make($user)->resolve());
});

Route::middleware(['auth:sanctum', 'active'])
    ->controller(ClientDashboardController::class)
    ->group(function () {
        Route::get('/client/dashboard', 'index');
    });

Route::middleware(['auth:sanctum', 'active'])
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

Route::middleware(['auth:sanctum', 'active'])->prefix('lawyer/profile')->group(function () {
    Route::get('/', [LawyerProfileController::class, 'show']);
    Route::patch('/', [LawyerProfileController::class, 'update']);
    Route::put('/specialties', [LawyerSpecialtyController::class, 'update']);
    Route::put('/service-areas', [LawyerServiceAreaController::class, 'update']);
});

Route::middleware(['auth:sanctum', 'active'])->controller(LegalRequestController::class)->group(function () {
    Route::get('/legal-requests', 'index');
    Route::get('/legal-requests/draft', 'draft');
    Route::post('/legal-requests', 'store');

    
    // Client can view submitted proposals for their own legal request.
    Route::get('/legal-requests/{legalRequest}/proposals', 'proposals');
    
    Route::get('/legal-requests/{legalRequest}', 'show');
    Route::patch('/legal-requests/{legalRequest}', 'update');
    Route::post('/legal-requests/{legalRequest}/submit', 'submit');
});

Route::middleware(['auth:sanctum', 'active'])
    ->controller(LegalRequestServiceIntentController::class)
    ->group(function () {
        Route::get('/legal-requests/{legalRequest}/service-options', 'options');
        Route::post('/legal-requests/{legalRequest}/service-intent', 'store');
    });

Route::middleware(['auth:sanctum', 'active'])
    ->controller(LawyerMatchingController::class)
    ->group(function () {
        Route::post('/legal-requests/{legalRequest}/matching', 'store');
        Route::get('/legal-requests/{legalRequest}/matching', 'show');
        Route::post('/legal-requests/{legalRequest}/lawyer-requests', 'sendRequests');
        Route::get('/legal-requests/{legalRequest}/consultation-lawyers', 'consultationLawyers');
    });

Route::middleware(['auth:sanctum', 'active'])
    ->controller(FinalLawyerSelectionController::class)
    ->group(function () {
        Route::post('/legal-requests/{legalRequest}/lawyer-selection', 'store');
        Route::get('/legal-requests/{legalRequest}/lawyer-selection', 'show');
    });

Route::middleware(['auth:sanctum', 'active'])->controller(DocumentController::class)->group(function () {
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
    
Route::middleware(['auth:sanctum', 'active'])
    ->controller(LawyerProposalController::class)
    ->group(function () {
        // Create a new proposal draft for a lawyer distribution.
        Route::post('/lawyer/distributions/{distribution}/proposal', 'store');

        // Update an existing proposal draft.
        Route::patch('/lawyer/proposals/{proposal:public_id}', 'update');

        // Submit an existing proposal draft.
        Route::post('/lawyer/proposals/{proposal:public_id}/submit', 'submit');

        Route::post('/lawyer/proposals/{proposal:public_id}/withdraw', 'withdraw');

        // Select a submitted proposal and create a pre-contract engagement.
        Route::post('/lawyer/proposals/{proposal:public_id}/select', 'select');

 });


Route::middleware(['auth:sanctum', 'active'])
    ->controller(LawyerWorkspaceController::class)
    ->group(function () {
        Route::get('/lawyer/opportunities', 'opportunities');
        Route::get('/lawyer/proposals', 'proposals');
        Route::get('/lawyer/engagements', 'engagements');
    });

Route::middleware(['auth:sanctum', 'active'])
    ->controller(EngagementController::class)
    ->group(function () {
        Route::get('/engagements/{engagement:public_id}', 'show');
        Route::get('/legal-requests/{legalRequest}/engagement', 'showForLegalRequest');
    });


Route::middleware(['auth:sanctum', 'active'])
    ->controller(LawyerInterestController::class)
    ->group(function () {
        Route::get('/lawyer/open-opportunities', 'openOpportunities');
        Route::post('/lawyer/legal-requests/{legalRequest}/interest', 'store');
        Route::get('/legal-requests/{legalRequest}/lawyer-interests', 'indexForClient');
        Route::post('/legal-requests/{legalRequest}/lawyer-interests/{distribution}/respond', 'respond');
    });

Route::middleware(['auth:sanctum', 'active'])
    ->controller(NegotiationController::class)
    ->group(function () {
        Route::get('/legal-requests/{legalRequest}/negotiations', 'indexForLegalRequest');
        Route::get('/lawyer/negotiations', 'indexForLawyer');
        Route::get('/negotiations/{negotiation:public_id}', 'show');
        Route::post('/negotiations/{negotiation:public_id}/messages', 'message');
        Route::post('/negotiations/{negotiation:public_id}/close', 'close');
        Route::post('/negotiations/{negotiation:public_id}/proposal', 'storeFinalProposal');
    });

Route::middleware(['auth:sanctum', 'active'])
    ->controller(LawyerProposalController::class)
    ->group(function () {
        Route::post('/legal-requests/{legalRequest}/proposals/{proposal:public_id}/select', 'selectForLegalRequest');
    });

Route::middleware(['auth:sanctum', 'active'])
    ->controller(EngagementController::class)
    ->group(function () {
        Route::post('/engagements/{engagement:public_id}/confirm', 'confirm');
    });

Route::middleware(['auth:sanctum', 'active'])
    ->controller(ContractController::class)
    ->group(function () {
        Route::get('/contracts/{contract:public_id}', 'show');
        Route::post('/contracts/{contract:public_id}/sign', 'sign');
    });

Route::middleware(['auth:sanctum', 'active'])
    ->controller(PaymentController::class)
    ->group(function () {
        Route::post('/invoices/{invoice:public_id}/payments', 'store');
        Route::get('/payments/{payment:public_id}', 'show');
    });

Route::post('/payments/{payment:public_id}/webhook', [PaymentController::class, 'webhook'])
    ->middleware('throttle:30,1');

Route::middleware(['auth:sanctum', 'active'])->prefix('lawyer/availabilities')->group(function () {
    Route::post('/', [LawyerAvailabilityController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'active'])->get(
    '/legal-requests/{legalRequest}/consultation-lawyers/{publicId}/slots',
    [LawyerAvailabilityController::class, 'consultationSlots'],
);

Route::middleware(['auth:sanctum', 'active'])->post(
    '/legal-requests/{legalRequest}/consultation-slots/{slot}/reserve',
    [ConsultationController::class, 'reserve'],
);

Route::middleware(['auth:sanctum', 'active'])
    ->post(
        '/legal-requests/{legalRequest}/lawyer-selection/{lawyerProfile:public_id}',
        [LawyerSelectionController::class, 'store'],
)
->withoutScopedBindings();

Route::middleware(['auth:sanctum', 'active'])
    ->post(
        '/lawyer/distributions/{distribution}/respond',
        [LawyerSelectionController::class, 'respond'],
);
    