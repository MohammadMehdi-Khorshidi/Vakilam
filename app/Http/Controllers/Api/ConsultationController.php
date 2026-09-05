<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Consultations\ReserveConsultationSlotRequest;
use App\Models\Consultation;
use App\Models\LawyerAvailability;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\LawyerMatching\LawyerMatchingService;
use App\Services\Conversations\ConversationProvisioner;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ConsultationController extends Controller
{
    /**
     * Temporarily reserve an open consultation slot.
     */
    public function reserve(
        ReserveConsultationSlotRequest $request,
        LegalRequest $legalRequest,
        LawyerAvailability $slot,
        LawyerMatchingService $matchingService,
        ConversationProvisioner $conversationProvisioner,
    ): JsonResponse {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->status === 'active'
                && $legalRequest->client_user_id === $user->id,
            403,
            'You are not allowed to reserve a consultation for this legal request.',
        );

        abort_unless(
            $legalRequest->status === 'submitted'
                && $legalRequest->service_intent === 'consultation',
            409,
            'Consultation booking is only available for submitted consultation requests.',
        );

        $result = DB::transaction(function () use (
            $legalRequest,
            $user,
            $slot,
            $matchingService,
            $conversationProvisioner,
        ): array {
            $lockedSlot = LawyerAvailability::query()
                ->whereKey($slot->id)
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * If an old reservation expired before payment,
             * cancel its pending consultation and release the slot.
             */
            if (
                $lockedSlot->status === 'reserved'
                && $lockedSlot->reserved_until !== null
                && $lockedSlot->reserved_until->isPast()
            ) {
                $expiredConsultation = $lockedSlot->consultation_id !== null
                    ? Consultation::query()
                        ->whereKey($lockedSlot->consultation_id)
                        ->lockForUpdate()
                        ->first()
                    : null;

                if (
                    $expiredConsultation === null
                    || $expiredConsultation->status === 'requested'
                ) {
                    if ($expiredConsultation !== null) {
                        $expiredConsultation->update([
                            'status' => 'cancelled',
                        ]);

                        $conversationProvisioner->closeForConsultation(
                            $expiredConsultation,
                        );
                    }

                    $lockedSlot->update([
                        'status' => 'open',
                        'reserved_until' => null,
                        'consultation_id' => null,
                    ]);

                    $lockedSlot->refresh();
                }
            }

            /*
             * Repeated request by the same client for the same active
             * reservation returns the existing consultation.
             */
            if (
                $lockedSlot->status === 'reserved'
                && $lockedSlot->reserved_until !== null
                && $lockedSlot->reserved_until->isFuture()
                && $lockedSlot->consultation_id !== null
            ) {
                $existingConsultation = Consultation::query()
                    ->whereKey($lockedSlot->consultation_id)
                    ->first();

                if (
                    $existingConsultation !== null
                    && $existingConsultation->legal_request_id === $legalRequest->id
                    && $existingConsultation->client_user_id === $user->id
                    && $existingConsultation->status === 'requested'
                ) {
                    $conversationProvisioner->forConsultation(
                        $existingConsultation,
                    );

                    return [
                        'consultation' => $existingConsultation,
                        'slot' => $lockedSlot,
                        'created' => false,
                    ];
                }

                abort(409, 'This consultation slot is currently reserved.');
            }

            abort_unless(
                $lockedSlot->status === 'open'
                    && $lockedSlot->starts_at->isFuture(),
                409,
                'This consultation slot is no longer available.',
            );

            /*
             * The slot must belong to a lawyer who is currently eligible
             * for this legal request.
             */
            $recommendations = $matchingService
                ->consultationRecommendations($legalRequest);

            $eligibleLawyer = $recommendations->contains(
                fn (array $recommendation): bool =>
                    $recommendation['lawyer']->id === $lockedSlot->lawyer_profile_id,
            );

            abort_unless(
                $eligibleLawyer,
                404,
                'This consultation slot is not available for this legal request.',
            );

            $consultation = Consultation::query()->create([
                'legal_request_id' => $legalRequest->id,
                'client_user_id' => $user->id,
                'lawyer_profile_id' => $lockedSlot->lawyer_profile_id,
                'status' => 'requested',
                'scheduled_start_at' => $lockedSlot->starts_at,
                'scheduled_end_at' => $lockedSlot->ends_at,
            ]);

            $lockedSlot->update([
                'status' => 'reserved',
                'reserved_until' => now()->addMinutes(10),
                'consultation_id' => $consultation->id,
            ]);

            $conversationProvisioner->forConsultation($consultation);

            return [
                'consultation' => $consultation,
                'slot' => $lockedSlot->fresh(),
                'created' => true,
            ];
        });

        /** @var Consultation $consultation */
        $consultation = $result['consultation'];

        /** @var LawyerAvailability $reservedSlot */
        $reservedSlot = $result['slot'];

        return response()->json([
            'message' => $result['created']
                ? 'Consultation slot reserved successfully.'
                : 'Existing consultation reservation returned.',
            'consultation' => [
                'public_id' => $consultation->public_id,
                'status' => $consultation->status,
                'scheduled_start_at' => $consultation->scheduled_start_at?->toISOString(),
                'scheduled_end_at' => $consultation->scheduled_end_at?->toISOString(),
            ],
            'reservation' => [
                'slot_id' => $reservedSlot->id,
                'status' => $reservedSlot->status,
                'reserved_until' => $reservedSlot->reserved_until?->toISOString(),
            ],
        ], $result['created'] ? 201 : 200);
    }
}
