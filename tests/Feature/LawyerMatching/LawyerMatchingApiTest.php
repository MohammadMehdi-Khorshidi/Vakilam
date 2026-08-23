<?php

use App\Models\City;
use App\Models\LawyerProfile;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\Province;
use App\Models\Specialty;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

/**
 * @return array{
 *     client: User,
 *     legal_request: LegalRequest,
 *     specialty: Specialty,
 *     province: Province,
 *     city: City
 * }
 */
function lawyerMatchingFixture(string $serviceIntent = 'lawyer_selection'): array
{
    $client = User::factory()->create();
    $category = LegalCategory::query()->create([
        'code' => 'family',
        'name' => 'Family',
        'status' => true,
    ]);
    $specialty = Specialty::query()->create([
        'code' => 'family',
        'name' => 'Family',
        'status' => true,
    ]);
    $province = Province::query()->create(['name' => 'Tehran']);
    $city = City::query()->create([
        'province_id' => $province->id,
        'name' => 'Tehran',
    ]);
    $legalRequest = LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'description' => 'A submitted family-law request.',
        'legal_category_id' => $category->id,
        'province_id' => $province->id,
        'city_id' => $city->id,
        'urgency' => 'normal',
        'service_intent' => $serviceIntent,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    return [
        'client' => $client,
        'legal_request' => $legalRequest,
        'specialty' => $specialty,
        'province' => $province,
        'city' => $city,
    ];
}

function matchingLawyer(
    Specialty $specialty,
    Province $province,
    ?City $city,
    array $profileAttributes = [],
    int $yearsExperience = 5,
): LawyerProfile
{
    $userAttributes = $profileAttributes['user'] ?? [];
    unset($profileAttributes['user']);
    $user = User::factory()->create($userAttributes);
    $lawyer = LawyerProfile::query()->create([
        'user_id' => $user->id,
        'full_name' => $user->name.' '.$user->last_name,
        'verification_status' => 'approved',
        'average_rating' => 4,
        'rating_count' => 2,
        'is_available' => true,
        ...$profileAttributes,
    ]);
    $lawyer->lawyerSpecialties()->create([
        'specialty_id' => $specialty->id,
        'years_experience' => $yearsExperience,
    ]);
    $lawyer->serviceAreas()->create([
        'province_id' => $province->id,
        'city_id' => $city?->id,
    ]);

    return $lawyer;
}

function addOpenConsultationSlot(LawyerProfile $lawyer): void
{
    DB::table('lawyer_availabilities')->insert([
        'id' => (string) Str::uuid(),
        'lawyer_profile_id' => $lawyer->id,
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHour(),
        'status' => 'open',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

test('a client can run idempotent matching for a submitted lawyer selection request', function () {
    $fixture = lawyerMatchingFixture();
    $provinceWide = matchingLawyer(
        $fixture['specialty'],
        $fixture['province'],
        null,
        ['full_name' => 'Province Lawyer'],
        8,
    );
    $cityLawyer = matchingLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
        ['full_name' => 'City Lawyer'],
        8,
    );

    Sanctum::actingAs($fixture['client']);

    $this->postJson("/api/legal-requests/{$fixture['legal_request']->id}/matching")
        ->assertCreated()
        ->assertJsonPath('data.algorithm_version', 'v1')
        ->assertJsonPath('data.status', 'completed')
        ->assertJsonPath('data.candidates_count', 2)
        ->assertJsonPath('data.candidates.0.lawyer.public_id', $cityLawyer->public_id)
        ->assertJsonPath('data.candidates.0.explanation.location_match', 'city')
        ->assertJsonPath('data.candidates.1.lawyer.public_id', $provinceWide->public_id);

    $this->assertDatabaseCount('lawyer_match_runs', 1);
    $this->assertDatabaseCount('lawyer_match_candidates', 2);
    $this->assertDatabaseCount('legal_request_distributions', 2);
    $this->assertDatabaseCount('legal_matters', 0);

    $this->postJson("/api/legal-requests/{$fixture['legal_request']->id}/matching")
        ->assertOk()
        ->assertJsonPath('message', 'The existing matching result was returned.');

    $this->assertDatabaseCount('lawyer_match_runs', 1);
    $this->assertDatabaseCount('legal_request_distributions', 2);
});

test('matching excludes ineligible lawyers and returns an empty successful result when needed', function () {
    $fixture = lawyerMatchingFixture();
    matchingLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
        ['verification_status' => 'pending'],
    );
    matchingLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
        ['is_available' => false],
    );
    matchingLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
        ['user' => ['status' => 'suspended']],
    );

    Sanctum::actingAs($fixture['client']);

    $this->postJson("/api/legal-requests/{$fixture['legal_request']->id}/matching")
        ->assertCreated()
        ->assertJsonPath('data.candidates_count', 0)
        ->assertJsonCount(0, 'data.candidates');

    $this->assertDatabaseCount('legal_request_distributions', 0);
});

test('a consultation request receives matching lawyers with open slots without persisted matching', function () {
    $fixture = lawyerMatchingFixture('consultation');
    $availableLawyer = matchingLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
        ['full_name' => 'Available Lawyer'],
    );
    matchingLawyer(
        $fixture['specialty'],
        $fixture['province'],
        $fixture['city'],
        ['full_name' => 'Lawyer Without Slot'],
    );
    addOpenConsultationSlot($availableLawyer);

    Sanctum::actingAs($fixture['client']);

    $this->getJson("/api/legal-requests/{$fixture['legal_request']->id}/consultation-lawyers")
        ->assertOk()
        ->assertJsonPath('meta.count', 1)
        ->assertJsonPath('data.0.lawyer.public_id', $availableLawyer->public_id);

    $this->assertDatabaseCount('lawyer_match_runs', 0);
    $this->assertDatabaseCount('lawyer_match_candidates', 0);
    $this->assertDatabaseCount('legal_request_distributions', 0);
});

test('matching endpoints enforce ownership and the selected service path', function () {
    $fixture = lawyerMatchingFixture();
    $otherClient = User::factory()->create();
    Sanctum::actingAs($otherClient);

    $this->postJson("/api/legal-requests/{$fixture['legal_request']->id}/matching")
        ->assertForbidden();
    $this->getJson("/api/legal-requests/{$fixture['legal_request']->id}/matching")
        ->assertForbidden();

    Sanctum::actingAs($fixture['client']);
    $this->getJson("/api/legal-requests/{$fixture['legal_request']->id}/consultation-lawyers")
        ->assertStatus(409);

    $fixture['legal_request']->forceFill(['service_intent' => 'consultation'])->save();
    $this->postJson("/api/legal-requests/{$fixture['legal_request']->id}/matching")
        ->assertStatus(409);
});
