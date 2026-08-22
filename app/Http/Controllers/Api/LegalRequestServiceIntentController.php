<?php

namespace App\Http\Controllers\Api;

use App\Enums\LegalRequestServiceIntent;
use App\Http\Controllers\Controller;
use App\Http\Requests\LegalRequests\SelectServiceIntentRequest;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\SelectLegalRequestServiceIntent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegalRequestServiceIntentController extends Controller
{
    public function options(Request $request, LegalRequest $legalRequest): JsonResponse
    {
        $this->ensureAccess($request, $legalRequest);
        $this->ensureSubmitted($legalRequest);

        return response()->json([
            'data' => [
                'selected_intent' => $legalRequest->service_intent,
                'options' => [
                    [
                        'key' => LegalRequestServiceIntent::AiAssistant->value,
                        'title' => 'AI assistant',
                        'available' => false,
                        'unavailable_reason' => 'coming_soon',
                    ],
                    [
                        'key' => LegalRequestServiceIntent::Consultation->value,
                        'title' => 'Consultation with a lawyer',
                        'available' => true,
                        'next_action' => 'select_consultation_lawyer',
                    ],
                    [
                        'key' => LegalRequestServiceIntent::LawyerSelection->value,
                        'title' => 'Select a lawyer',
                        'available' => true,
                        'next_action' => 'start_lawyer_selection',
                    ],
                ],
            ],
        ]);
    }

    public function store(
        SelectServiceIntentRequest $request,
        LegalRequest $legalRequest,
        SelectLegalRequestServiceIntent $selector,
    ): JsonResponse {
        $serviceIntent = LegalRequestServiceIntent::from(
            $request->validated('service_intent'),
        );
        $legalRequest = $selector->handle($legalRequest, $serviceIntent);

        return response()->json([
            'message' => 'Service intent selected successfully.',
            'data' => [
                'legal_request_id' => $legalRequest->id,
                'legal_request_public_id' => $legalRequest->public_id,
                'service_intent' => $legalRequest->service_intent,
                'next_action' => match ($serviceIntent) {
                    LegalRequestServiceIntent::Consultation => 'select_consultation_lawyer',
                    LegalRequestServiceIntent::LawyerSelection => 'start_lawyer_selection',
                    default => null,
                },
            ],
        ]);
    }

    private function ensureAccess(Request $request, LegalRequest $legalRequest): void
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $legalRequest->client_user_id === $user->id,
            403,
            'You are not allowed to select a service for this legal request.',
        );
    }

    private function ensureSubmitted(LegalRequest $legalRequest): void
    {
        abort_unless(
            $legalRequest->status === 'submitted',
            409,
            'A service can only be selected for a submitted legal request.',
        );
    }
}
