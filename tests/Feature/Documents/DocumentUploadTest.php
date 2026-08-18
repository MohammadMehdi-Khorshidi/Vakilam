<?php

use App\Models\Document;
use App\Models\Engagement;
use App\Models\LawyerProfile;
use App\Models\LegalMatter;
use App\Models\LegalRequest;
use App\Models\MatterMember;
use App\Models\StoredFile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

beforeEach(function () {
    Storage::fake('local');
});

function documentTestRequest(User $client): LegalRequest
{
    return LegalRequest::query()->create([
        'client_user_id' => $client->id,
        'title' => 'Contract dispute',
        'description' => 'Document upload test request.',
        'service_intent' => 'lawyer_selection',
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
}

/** @return array{0: LegalMatter, 1: User} */
function documentTestMatter(User $client, LegalRequest $legalRequest): array
{
    $lawyer = User::factory()->create();
    $lawyerProfile = LawyerProfile::query()->create([
        'user_id' => $lawyer->id,
        'full_name' => $lawyer->name.' '.$lawyer->last_name,
        'verification_status' => 'approved',
    ]);
    $engagement = Engagement::query()->create([
        'legal_request_id' => $legalRequest->id,
        'client_user_id' => $client->id,
        'lawyer_profile_id' => $lawyerProfile->id,
        'status' => 'active',
        'started_at' => now(),
    ]);
    $legalMatter = LegalMatter::query()->create([
        'source_legal_request_id' => $legalRequest->id,
        'engagement_id' => $engagement->id,
        'client_user_id' => $client->id,
        'title' => 'Contract dispute matter',
        'status' => 'active',
        'opened_at' => now(),
    ]);

    return [$legalMatter, $lawyer];
}

function uploadRequestTestDocument(TestCase $test, LegalRequest $legalRequest, array $overrides = [])
{
    return $test->postJson(
        "/api/legal-requests/{$legalRequest->id}/documents",
        array_merge([
            'title' => 'National ID card',
            'file' => UploadedFile::fake()->create('evidence.pdf', 100, 'application/pdf'),
        ], $overrides),
    );
}

function uploadMatterTestDocument(TestCase $test, LegalMatter $legalMatter, array $overrides = [])
{
    return $test->postJson(
        "/api/legal-matters/{$legalMatter->id}/documents",
        array_merge([
            'title' => 'Court notice',
            'file' => UploadedFile::fake()->create('notice.pdf', 100, 'application/pdf'),
        ], $overrides),
    );
}

test('document routes require authentication', function () {
    $client = User::factory()->create();
    $legalRequest = documentTestRequest($client);
    [$legalMatter] = documentTestMatter($client, $legalRequest);

    uploadRequestTestDocument($this, $legalRequest)->assertUnauthorized();
    uploadMatterTestDocument($this, $legalMatter)->assertUnauthorized();
    $this->getJson("/api/legal-requests/{$legalRequest->id}/documents")->assertUnauthorized();
    $this->getJson("/api/legal-matters/{$legalMatter->id}/documents")->assertUnauthorized();
});

test('the client can upload an initial request document of at most five megabytes', function () {
    $client = User::factory()->create();
    $legalRequest = documentTestRequest($client);
    Sanctum::actingAs($client);

    uploadRequestTestDocument($this, $legalRequest, [
        'file' => UploadedFile::fake()->create('too-large.pdf', 5121, 'application/pdf'),
    ])->assertUnprocessable()->assertJsonValidationErrors('file');

    $response = uploadRequestTestDocument($this, $legalRequest, [
        'file' => UploadedFile::fake()->create('five-megabytes.pdf', 5120, 'application/pdf'),
    ])->assertCreated()
        ->assertJsonPath('message', 'Document uploaded successfully.')
        ->assertJsonPath('document.legal_request_id', $legalRequest->id)
        ->assertJsonPath('document.legal_matter_id', null)
        ->assertJsonPath('document.owner_user_id', $client->id)
        ->assertJsonPath('document.versions.0.version_number', 1);

    $storedFile = StoredFile::query()->findOrFail($response->json('document.current_file.id'));
    expect($storedFile->checksum_sha256)->toHaveLength(64);
    Storage::disk('local')->assertExists($storedFile->path);
});

test('the client can upload version and archive documents while preserving file history', function () {
    $client = User::factory()->create();
    $legalRequest = documentTestRequest($client);
    Sanctum::actingAs($client);
    $response = uploadRequestTestDocument($this, $legalRequest)->assertCreated();
    $documentId = $response->json('document.id');

    $this->postJson("/api/documents/{$documentId}/versions", [
        'file' => UploadedFile::fake()->create('replacement.jpg', 100, 'image/jpeg'),
    ])->assertOk()->assertJsonPath('document.versions.1.version_number', 2);

    $this->get("/api/documents/{$documentId}/download")
        ->assertOk()->assertDownload('replacement.jpg');
    $this->deleteJson("/api/documents/{$documentId}")
        ->assertOk()->assertJsonPath('message', 'Document archived successfully.');

    expect(Document::query()->findOrFail($documentId)->current_file_id)->toBeNull();
    $this->assertDatabaseCount('files', 2);
    $this->assertDatabaseCount('document_versions', 2);
});

test('after lawyer selection the assigned lawyer can view all documents but cannot manage them', function () {
    $client = User::factory()->create();
    $legalRequest = documentTestRequest($client);
    [$legalMatter, $lawyer] = documentTestMatter($client, $legalRequest);

    Sanctum::actingAs($client);
    $initialDocumentId = uploadRequestTestDocument($this, $legalRequest)->assertCreated()->json('document.id');
    $matterDocumentId = uploadMatterTestDocument($this, $legalMatter)
        ->assertCreated()
        ->assertJsonPath('document.legal_request_id', null)
        ->assertJsonPath('document.legal_matter_id', $legalMatter->id)
        ->json('document.id');

    Sanctum::actingAs($lawyer);
    $this->getJson("/api/legal-matters/{$legalMatter->id}/documents")
        ->assertOk()
        ->assertJsonCount(2, 'documents')
        ->assertJsonFragment(['id' => $initialDocumentId])
        ->assertJsonFragment(['id' => $matterDocumentId]);
    $this->getJson("/api/documents/{$initialDocumentId}")->assertOk();
    $this->get("/api/documents/{$matterDocumentId}/download")
        ->assertOk()->assertDownload('notice.pdf');

    uploadMatterTestDocument($this, $legalMatter)->assertForbidden();
    $this->postJson("/api/documents/{$matterDocumentId}/versions", [
        'file' => UploadedFile::fake()->create('lawyer-change.pdf', 100, 'application/pdf'),
    ])->assertForbidden();
    $this->deleteJson("/api/documents/{$matterDocumentId}")->assertForbidden();
});

test('outsiders and assistant membership rows do not grant document access', function () {
    $client = User::factory()->create();
    $legalRequest = documentTestRequest($client);
    [$legalMatter] = documentTestMatter($client, $legalRequest);
    $assistantUser = User::factory()->create();
    MatterMember::query()->create([
        'legal_matter_id' => $legalMatter->id,
        'user_id' => $assistantUser->id,
        'member_role' => 'assistant',
        'joined_at' => now(),
    ]);

    Sanctum::actingAs($client);
    $documentId = uploadMatterTestDocument($this, $legalMatter)->assertCreated()->json('document.id');

    Sanctum::actingAs($assistantUser);
    $this->getJson("/api/legal-matters/{$legalMatter->id}/documents")->assertForbidden();
    $this->getJson("/api/documents/{$documentId}")->assertForbidden();
    $this->getJson("/api/documents/{$documentId}/download")->assertForbidden();
    uploadMatterTestDocument($this, $legalMatter)->assertForbidden();
});

test('closed requests and matters reject new uploads and versions', function () {
    $client = User::factory()->create();
    $legalRequest = documentTestRequest($client);
    [$legalMatter] = documentTestMatter($client, $legalRequest);
    Sanctum::actingAs($client);
    $requestDocumentId = uploadRequestTestDocument($this, $legalRequest)->assertCreated()->json('document.id');
    $matterDocumentId = uploadMatterTestDocument($this, $legalMatter)->assertCreated()->json('document.id');

    $legalRequest->update(['status' => 'closed']);
    $legalMatter->update(['status' => 'closed']);

    uploadRequestTestDocument($this, $legalRequest)->assertStatus(409);
    uploadMatterTestDocument($this, $legalMatter)->assertStatus(409);

    foreach ([$requestDocumentId, $matterDocumentId] as $documentId) {
        $this->postJson("/api/documents/{$documentId}/versions", [
            'file' => UploadedFile::fake()->create('blocked.pdf', 100, 'application/pdf'),
        ])->assertStatus(409);
    }
});
