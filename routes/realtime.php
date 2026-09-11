<?php

use App\Http\Controllers\Api\LawyerProposalController;
use Illuminate\Support\Facades\Route;

Route::post(
    '/lawyer/proposals/{proposal:public_id}/reject',
    [LawyerProposalController::class, 'reject'],
);
