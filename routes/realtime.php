<?php

use App\Http\Controllers\Api\ClientEngagementController;
use App\Http\Controllers\Api\EngagementDocumentRequestController;
use App\Http\Controllers\Api\EngagementWorkflowController;
use App\Http\Controllers\Api\LawyerCasesController;
use App\Http\Controllers\Api\LawyerProposalController;
use App\Http\Controllers\Api\NegotiationPresenceController;
use Illuminate\Support\Facades\Route;

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
