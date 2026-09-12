<?php

use App\Http\Controllers\Api\EngagementWorkflowController;
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
