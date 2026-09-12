<?php

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
