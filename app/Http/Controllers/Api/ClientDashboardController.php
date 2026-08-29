<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientDashboardResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $draftCases = $user->legalRequests()
            ->where('status', 'draft')
            ->latest('updated_at')
            ->get();

        $submittedRequests = $user->legalRequests()
            ->whereIn('status', ['submitted', 'matched'])
            ->latest('updated_at')
            ->get();

        $activeCases = $user->legalMatters()
            ->latest('updated_at')
            ->get();

        return response()->json(
            ClientDashboardResource::make([
                'draft_cases' => $draftCases,
                'submitted_requests' => $submittedRequests,
                'active_cases' => $activeCases,
            ])
        );
    }
}