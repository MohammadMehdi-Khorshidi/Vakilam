<?php

use App\Http\Controllers\Api\ConsultationBookingController;
use App\Http\Controllers\Api\LawyerConsultationRateController;
use App\Http\Controllers\Api\ConsultationDirectoryController;
use App\Http\Controllers\Api\LawyerAvailabilityController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Admin\AdminPanelController;

use App\Http\Controllers\Api\ClientEngagementController;
use App\Http\Controllers\Api\EngagementDocumentRequestController;
use App\Http\Controllers\Api\EngagementWorkflowController;
use App\Http\Controllers\Api\LawyerCasesController;
use App\Http\Controllers\Api\LawyerProposalController;
use App\Http\Controllers\Api\NegotiationPresenceController;
use App\Http\Controllers\Api\NegotiationAttachmentController;
use Illuminate\Support\Facades\Route;




Route::prefix('admin')->controller(AdminPanelController::class)->group(function () {
    Route::get('/dashboard', 'dashboard');
    Route::get('/users', 'users');
    Route::patch('/users/{user}/status', 'setUserStatus');
    Route::get('/lawyers', 'lawyers');
    Route::post('/lawyer-verifications/{verification}/review', 'reviewLawyer');
    Route::get('/legal-requests', 'legalRequests');
    Route::get('/consultations', 'consultations');
    Route::get('/activity', 'activity');
    Route::get('/admins', 'admins');
    Route::patch('/admins/{user}', 'setAdminRole');
});

Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
Route::post('/notifications/{notification}/read', [NotificationController::class, 'read']);

Route::get('/realtime/config', function () {
    $app = config('reverb.apps.apps.0', []);
    $options = $app['options'] ?? [];

    return response()->json([
        'data' => [
            'key' => (string) ($app['key'] ?? ''),
            'host' => (string) ($options['host'] ?? '127.0.0.1'),
            'port' => (int) ($options['port'] ?? 8080),
            'scheme' => (string) ($options['scheme'] ?? 'http'),
            'auth_endpoint' => request()->getSchemeAndHttpHost().'/api/broadcasting/auth',
        ],
    ]);
});


Route::post(
    '/negotiations/{negotiation:public_id}/presence',
    [NegotiationPresenceController::class, 'touch'],
);

Route::post(
    '/lawyer/proposals/{proposal:public_id}/reject',
    [LawyerProposalController::class, 'reject'],
);

Route::get('/lawyer/cases', [LawyerCasesController::class, 'index']);
Route::get('/lawyer/cases/{engagement:public_id}', [LawyerCasesController::class, 'show']);
Route::get('/client/engagements', [ClientEngagementController::class, 'index']);

Route::get(
    '/engagements/{engagement:public_id}/workspace',
    [EngagementWorkflowController::class, 'show'],
);

Route::patch(
    '/engagements/{engagement:public_id}/workspace',
    [EngagementWorkflowController::class, 'update'],
);

Route::post(
    '/engagements/{engagement:public_id}/contract/send',
    [EngagementWorkflowController::class, 'sendContract'],
);

Route::post(
    '/engagements/{engagement:public_id}/document-requests',
    [EngagementDocumentRequestController::class, 'store'],
);

Route::delete(
    '/engagement-document-requests/{documentRequest:public_id}',
    [EngagementDocumentRequestController::class, 'destroy'],
);

Route::post(
    '/engagement-document-requests/{documentRequest:public_id}/upload',
    [EngagementDocumentRequestController::class, 'upload'],
);

Route::post(
    '/engagement-document-requests/{documentRequest:public_id}/review',
    [EngagementDocumentRequestController::class, 'review'],
);


Route::post(
    '/negotiations/{negotiation:public_id}/attachments',
    [NegotiationAttachmentController::class, 'store'],
);

Route::get(
    '/negotiation-attachments/{attachment:public_id}/download',
    [NegotiationAttachmentController::class, 'download'],
);

// Consultation booking
Route::get('/lawyer/consultation-rates', [LawyerConsultationRateController::class, 'index']);
Route::put('/lawyer/consultation-rates', [LawyerConsultationRateController::class, 'update']);
Route::get('/lawyer/availabilities', [LawyerAvailabilityController::class, 'index']);
Route::patch('/lawyer/availabilities/{availability}', [LawyerAvailabilityController::class, 'update']);
Route::delete('/lawyer/availabilities/{availability}', [LawyerAvailabilityController::class, 'destroy']);

Route::get('/legal-requests/{legalRequest}/consultation-directory', [ConsultationDirectoryController::class, 'index']);
Route::post('/legal-requests/{legalRequest}/consultation-holds', [ConsultationBookingController::class, 'hold']);
Route::get('/consultations/{consultation:public_id}', [ConsultationBookingController::class, 'show']);
Route::delete('/consultations/{consultation:public_id}/hold', [ConsultationBookingController::class, 'cancelHold']);
Route::post('/consultations/{consultation:public_id}/payment-step', [ConsultationBookingController::class, 'paymentStep']);
Route::get('/client/consultations', [ConsultationBookingController::class, 'clientIndex']);
Route::get('/lawyer/consultations', [ConsultationBookingController::class, 'lawyerIndex']);
