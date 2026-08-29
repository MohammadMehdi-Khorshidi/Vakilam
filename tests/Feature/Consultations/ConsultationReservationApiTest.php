<?php

use App\Models\Consultation;
use App\Models\LawyerAvailability;
use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\LawyerMatching\LawyerMatchingService;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;

test('a client can reserve an open consultation slot for ten minutes', function () {
    Carbon::setTestNow(
        Carbon::parse('2026-08-24 08:00:00', 'UTC')
    );

    try {
        $client = User::factory()->create([
            'status' => 'active',
        ]);

        $lawyerUser = User::factory()->create([
            'status' => 'active',
        ]);

        $lawyer = LawyerProfile::query()->create([
            'user_id' => $lawyerUser->id,
            'full_name' => 'Test Lawyer',
            'verification_status' => 'approved',
            'is_available' => true,
        ]);

        $legalRequest = LegalRequest::query()->create([
            'client_user_id' => $client->id,
            'title' => 'Consultation request',
            'description' => 'Test consultation request.',
            'service_intent' => 'consultation',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $slot = LawyerAvailability::query()->create([
            'lawyer_profile_id' => $lawyer->id,
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
            'status' => 'open',
        ]);

        /*
         * Reservation behavior is tested independently from the
         * matching algorithm. We only confirm that this lawyer is
         * eligible for this legal request.
         */
        $this->mock(
            LawyerMatchingService::class,
            function ($mock) use ($lawyer, $legalRequest) {
                $mock->shouldReceive('consultationRecommendations')
                    ->once()
                    ->withArgs(
                        fn (LegalRequest $request): bool => $request->is($legalRequest)
                    )
                    ->andReturn(collect([
                        [
                            'lawyer' => $lawyer,
                        ],
                    ]));
            }
        );

        Sanctum::actingAs($client);

        $response = $this->postJson(
            "/api/legal-requests/{$legalRequest->id}/consultation-slots/{$slot->id}/reserve"
        );

        $response
            ->assertCreated()
            ->assertJsonPath('consultation.status', 'requested')
            ->assertJsonPath('reservation.slot_id', $slot->id)
            ->assertJsonPath('reservation.status', 'reserved')
            ->assertJsonPath(
                'reservation.reserved_until',
                now()->addMinutes(10)->toISOString()
            );

        $consultation = Consultation::query()
            ->where('legal_request_id', $legalRequest->id)
            ->where('client_user_id', $client->id)
            ->where('lawyer_profile_id', $lawyer->id)
            ->first();

        expect($consultation)
            ->not->toBeNull()
            ->and($consultation->status)->toBe('requested');

        $slot->refresh();

        expect($slot->status)
            ->toBe('reserved')
            ->and($slot->consultation_id)
            ->toBe($consultation->id)
            ->and($slot->reserved_until->equalTo(now()->addMinutes(10)))
            ->toBeTrue();
    } finally {
        Carbon::setTestNow();
    }
});

test('another client cannot reserve an already reserved consultation slot', function () {
    Carbon::setTestNow(
        Carbon::parse('2026-08-24 08:00:00', 'UTC')
    );

    try {
        $firstClient = User::factory()->create([
            'status' => 'active',
        ]);

        $secondClient = User::factory()->create([
            'status' => 'active',
        ]);

        $lawyerUser = User::factory()->create([
            'status' => 'active',
        ]);

        $lawyer = LawyerProfile::query()->create([
            'user_id' => $lawyerUser->id,
            'full_name' => 'Test Lawyer',
            'verification_status' => 'approved',
            'is_available' => true,
        ]);

        $firstLegalRequest = LegalRequest::query()->create([
            'client_user_id' => $firstClient->id,
            'title' => 'First consultation request',
            'description' => 'First consultation request.',
            'service_intent' => 'consultation',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $secondLegalRequest = LegalRequest::query()->create([
            'client_user_id' => $secondClient->id,
            'title' => 'Second consultation request',
            'description' => 'Second consultation request.',
            'service_intent' => 'consultation',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $consultation = Consultation::query()->create([
            'legal_request_id' => $firstLegalRequest->id,
            'client_user_id' => $firstClient->id,
            'lawyer_profile_id' => $lawyer->id,
            'status' => 'requested',
            'scheduled_start_at' => now()->addDay(),
            'scheduled_end_at' => now()->addDay()->addHour(),
        ]);

        $slot = LawyerAvailability::query()->create([
            'lawyer_profile_id' => $lawyer->id,
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
            'status' => 'reserved',
            'reserved_until' => now()->addMinutes(10),
            'consultation_id' => $consultation->id,
        ]);

        Sanctum::actingAs($secondClient);

        $response = $this->postJson(
            "/api/legal-requests/{$secondLegalRequest->id}/consultation-slots/{$slot->id}/reserve"
        );

        $response
            ->assertStatus(409)
            ->assertJsonPath(
                'message',
                'This consultation slot is currently reserved.'
            );

        expect(
            Consultation::query()
                ->where('lawyer_profile_id', $lawyer->id)
                ->count()
        )->toBe(1);

        expect($slot->status)
            ->toBe('reserved')
            ->and($slot->consultation_id)
            ->toBe($consultation->id);
    } finally {
        Carbon::setTestNow();
    }
});

test('an expired reservation can be released and reserved by another client', function () {
    Carbon::setTestNow(
        Carbon::parse('2026-08-24 08:20:00', 'UTC')
    );

    try {
        $firstClient = User::factory()->create([
            'status' => 'active',
        ]);

        $secondClient = User::factory()->create([
            'status' => 'active',
        ]);

        $lawyerUser = User::factory()->create([
            'status' => 'active',
        ]);

        $lawyer = LawyerProfile::query()->create([
            'user_id' => $lawyerUser->id,
            'full_name' => 'Test Lawyer',
            'verification_status' => 'approved',
            'is_available' => true,
        ]);

        $firstLegalRequest = LegalRequest::query()->create([
            'client_user_id' => $firstClient->id,
            'title' => 'Expired consultation request',
            'description' => 'Expired consultation reservation.',
            'service_intent' => 'consultation',
            'status' => 'submitted',
            'submitted_at' => now()->subHour(),
        ]);

        $secondLegalRequest = LegalRequest::query()->create([
            'client_user_id' => $secondClient->id,
            'title' => 'New consultation request',
            'description' => 'New consultation reservation.',
            'service_intent' => 'consultation',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $oldConsultation = Consultation::query()->create([
            'legal_request_id' => $firstLegalRequest->id,
            'client_user_id' => $firstClient->id,
            'lawyer_profile_id' => $lawyer->id,
            'status' => 'requested',
            'scheduled_start_at' => now()->addDay(),
            'scheduled_end_at' => now()->addDay()->addHour(),
        ]);

        $slot = LawyerAvailability::query()->create([
            'lawyer_profile_id' => $lawyer->id,
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
            'status' => 'reserved',
            'reserved_until' => now()->subMinute(),
            'consultation_id' => $oldConsultation->id,
        ]);

        $this->mock(
            LawyerMatchingService::class,
            function ($mock) use ($lawyer, $secondLegalRequest) {
                $mock->shouldReceive('consultationRecommendations')
                    ->once()
                    ->withArgs(
                        fn (LegalRequest $request): bool => $request->is($secondLegalRequest)
                    )
                    ->andReturn(collect([
                        [
                            'lawyer' => $lawyer,
                        ],
                    ]));
            }
        );

        Sanctum::actingAs($secondClient);

        $response = $this->postJson(
            "/api/legal-requests/{$secondLegalRequest->id}/consultation-slots/{$slot->id}/reserve"
        );

        $response
            ->assertCreated()
            ->assertJsonPath('consultation.status', 'requested')
            ->assertJsonPath('reservation.status', 'reserved')
            ->assertJsonPath(
                'reservation.reserved_until',
                now()->addMinutes(10)->toISOString()
            );

        $oldConsultation->refresh();

        expect($oldConsultation->status)
            ->toBe('cancelled');

        $newConsultation = Consultation::query()
            ->where('legal_request_id', $secondLegalRequest->id)
            ->where('client_user_id', $secondClient->id)
            ->first();

        expect($newConsultation)
            ->not->toBeNull()
            ->and($newConsultation->status)
            ->toBe('requested');

        $slot->refresh();

        expect($slot->status)
            ->toBe('reserved')
            ->and($slot->consultation_id)
            ->toBe($newConsultation->id)
            ->and($slot->reserved_until->equalTo(now()->addMinutes(10)))
            ->toBeTrue();
    } finally {
        Carbon::setTestNow();
    }
});

test('repeating the same active reservation returns the existing consultation', function () {
    Carbon::setTestNow(
        Carbon::parse('2026-08-24 08:00:00', 'UTC')
    );

    try {
        $client = User::factory()->create([
            'status' => 'active',
        ]);

        $lawyerUser = User::factory()->create([
            'status' => 'active',
        ]);

        $lawyer = LawyerProfile::query()->create([
            'user_id' => $lawyerUser->id,
            'full_name' => 'Test Lawyer',
            'verification_status' => 'approved',
            'is_available' => true,
        ]);

        $legalRequest = LegalRequest::query()->create([
            'client_user_id' => $client->id,
            'title' => 'Consultation request',
            'description' => 'Consultation request.',
            'service_intent' => 'consultation',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $consultation = Consultation::query()->create([
            'legal_request_id' => $legalRequest->id,
            'client_user_id' => $client->id,
            'lawyer_profile_id' => $lawyer->id,
            'status' => 'requested',
            'scheduled_start_at' => now()->addDay(),
            'scheduled_end_at' => now()->addDay()->addHour(),
        ]);

        $reservedUntil = now()->addMinutes(10);

        $slot = LawyerAvailability::query()->create([
            'lawyer_profile_id' => $lawyer->id,
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
            'status' => 'reserved',
            'reserved_until' => $reservedUntil,
            'consultation_id' => $consultation->id,
        ]);

        Sanctum::actingAs($client);

        $response = $this->postJson(
            "/api/legal-requests/{$legalRequest->id}/consultation-slots/{$slot->id}/reserve"
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Existing consultation reservation returned.'
            )
            ->assertJsonPath(
                'consultation.public_id',
                $consultation->public_id
            )
            ->assertJsonPath(
                'reservation.slot_id',
                $slot->id
            )
            ->assertJsonPath(
                'reservation.status',
                'reserved'
            );

        expect(
            Consultation::query()
                ->where('legal_request_id', $legalRequest->id)
                ->count()
        )->toBe(1);

        $slot->refresh();

        expect($slot->consultation_id)
            ->toBe($consultation->id)
            ->and($slot->reserved_until->equalTo($reservedUntil))
            ->toBeTrue();
    } finally {
        Carbon::setTestNow();
    }
});
