<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientCaseResource;
use App\Models\LegalMatter;
use App\Models\User;
use Illuminate\Http\Request;

class ClientCaseController extends Controller
{
    public function show(Request $request, LegalMatter $legalMatter)
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless(
            $legalMatter->client_user_id === $user->id,
            403,
            'You are not allowed to view this legal matter.'
        );

        $legalMatter->load([
            'sourceLegalRequest',
            'documents',
            'timelineEvents',
        ]);

        return ClientCaseResource::make($legalMatter);
    }
}