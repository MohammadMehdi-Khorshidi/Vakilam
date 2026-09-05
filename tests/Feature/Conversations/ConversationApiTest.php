<?php

use App\Models\ClientProfile;
use App\Models\Consultation;
use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\Conversations\ConversationProvisioner;
use Laravel\Sanctum\Sanctum;

test('only active participants can read and send persisted conversation messages', function () {
    $client = User::factory()->create(['status' => 'active']);
    $lawyerUser = User::factory()->create(['status' => 'active']);
    $outsider = User::factory()->create(['status' => 'active']);

    ClientProfile::query()->create([
        'user_id' => $client->id,
        'full_name' => 'Test Client',
    ]);

    $lawyer = LawyerProfile::query()->create([
        'user_id' => $lawyerUser->id,
        'full_name' => 'Test Lawyer',
        'verification_status' => 'approved',
        'is_available' => true,
    ]);

    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Persisted consultation conversation',
        'description' => 'Conversation API test.',
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

    $conversation = app(ConversationProvisioner::class)
        ->forConsultation($consultation);

    expect($conversation)->not->toBeNull();

    Sanctum::actingAs($client);

    $this->getJson('/api/conversations')
        ->assertOk()
        ->assertJsonPath('data.0.public_id', $conversation->public_id)
        ->assertJsonPath('data.0.counterpart.name', 'Test Lawyer');

    $this->postJson("/api/conversations/{$conversation->public_id}/messages", [
        'body' => 'This message must survive a browser restart.',
    ])->assertCreated()
        ->assertJsonPath('data.body', 'This message must survive a browser restart.')
        ->assertJsonPath('data.is_mine', true);

    Sanctum::actingAs($lawyerUser);

    $this->getJson("/api/conversations/{$conversation->public_id}")
        ->assertOk()
        ->assertJsonPath('data.messages.0.body', 'This message must survive a browser restart.')
        ->assertJsonPath('data.messages.0.is_mine', false);

    Sanctum::actingAs($outsider);

    $this->getJson("/api/conversations/{$conversation->public_id}")
        ->assertForbidden();

    $this->postJson("/api/conversations/{$conversation->public_id}/messages", [
        'body' => 'Unauthorized message.',
    ])->assertForbidden();

    $this->assertDatabaseCount('messages', 1);
});
