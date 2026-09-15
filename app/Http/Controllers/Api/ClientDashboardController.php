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

        $requestRelations = ['legalCategory', 'province', 'city'];

        $draftCases = $user->legalRequests()
            ->with($requestRelations)
            ->where('status', 'draft')
            ->latest('updated_at')
            ->get();

        $submittedRequests = $user->legalRequests()
            ->with($requestRelations)
            ->whereIn('status', ['submitted', 'matched'])
            ->latest('updated_at')
            ->get();

        $activeCases = $user->legalMatters()
            ->with([
                'sourceLegalRequest.legalCategory',
                'sourceLegalRequest.province',
                'sourceLegalRequest.city',
            ])
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
