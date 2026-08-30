<?php

namespace App\Http\Controllers\Api;

use App\Enums\LegalRequestServiceIntent;
use App\Http\Controllers\Controller;
use App\Http\Requests\LegalRequests\StoreLegalRequestRequest;
use App\Http\Requests\LegalRequests\UpdateLegalRequestRequest;
use App\Http\Resources\LegalRequestListResource;
use App\Http\Resources\LegalRequestResource;
use App\Models\LegalRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class LegalRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $legalRequests = $user->legalRequests()
            ->with([
                'legalCategory',
                'province',
                'city',
            ])
            ->where('status', '!=', 'draft')
            ->latest('updated_at')
            ->get();

        return response()->json([
            'active_cases' => LegalRequestListResource::collection($legalRequests),
        ]);
    }

    public function store(StoreLegalRequestRequest $request): JsonResponse
    {
        /** @var User $client */
        $client = $request->user();
        $data = $request->validated();

        [$legalRequest, $created] = DB::transaction(function () use ($client, $data): array {
            // Serialise draft creation for this user so two simultaneous autosaves
            // cannot create two active drafts.
            User::query()
                ->whereKey($client->id)
                ->lockForUpdate()
                ->firstOrFail();

            $existingDraft = LegalRequest::query()
                ->where('client_user_id', $client->id)
                ->where('status', 'draft')
                ->first();

            if ($existingDraft !== null) {
                return [$existingDraft, false];
            }

            $legalRequest = LegalRequest::query()->create([
                'client_user_id' => $client->id,
                ...Arr::only($data, [
                    'title',
                    'description',
                    'legal_category_id',
                    'province_id',
                    'city_id',
                    'urgency',
                    'service_intent',
                ]),
                'status' => 'draft',
            ]);

            foreach ($data['parties'] ?? [] as $party) {
                $legalRequest->parties()->forceCreate([
                    ...Arr::only($party, [
                        'party_role',
                        'full_name',
                        'relation_note',
                        'is_client',
                    ]),
                    'is_client' => (bool) ($party['is_client'] ?? false),
                ]);
            }

            return [$legalRequest, true];
        });

        $this->loadResumeRelations($legalRequest);

        return response()->json([
            'message' => $created
                ? 'Legal request created successfully.'
                : 'An active draft already exists.',
            'legal_request' => LegalRequestResource::make($legalRequest)->resolve(),
        ], $created ? 201 : 200);
    }

    public function draft(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $legalRequest = LegalRequest::query()
            ->where('client_user_id', $user->id)
            ->where('status', 'draft')
            ->latest('updated_at')
            ->first();

        if ($legalRequest === null) {
            return response()->json([
                'legal_request' => null,
            ]);
        }

        $this->loadResumeRelations($legalRequest);

        return response()->json([
            'legal_request' => LegalRequestResource::make($legalRequest)->resolve(),
        ]);
    }

    public function show(
        Request $request,
        LegalRequest $legalRequest,
    ): JsonResponse {
        $this->ensureOwner($request, $legalRequest);
        $this->loadResumeRelations($legalRequest);

        return response()->json([
            'legal_request' => LegalRequestResource::make($legalRequest)->resolve(),
        ]);
    }

    public function update(
        UpdateLegalRequestRequest $request,
        LegalRequest $legalRequest,
    ): JsonResponse {
        abort_unless(
            $legalRequest->status === 'draft',
            409,
            'Only draft legal requests can be updated.',
        );

        $data = $request->validated();

        $legalRequest = DB::transaction(function () use ($legalRequest, $data): LegalRequest {
            $lockedRequest = LegalRequest::query()
                ->whereKey($legalRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedRequest->status === 'draft',
                409,
                'Only draft legal requests can be updated.',
            );

            $attributes = Arr::only($data, [
                'title',
                'description',
                'legal_category_id',
                'province_id',
                'city_id',
                'urgency',
                'service_intent',
            ]);

            if (
                array_key_exists('province_id', $attributes)
                && ! array_key_exists('city_id', $attributes)
                && (string) $attributes['province_id'] !== (string) $lockedRequest->province_id
            ) {
                $attributes['city_id'] = null;
            }

            $lockedRequest->fill($attributes)->save();

            if (array_key_exists('parties', $data)) {
                $lockedRequest->parties()->delete();

                foreach ($data['parties'] as $party) {
                    $lockedRequest->parties()->forceCreate([
                        ...Arr::only($party, [
                            'party_role',
                            'full_name',
                            'relation_note',
                            'is_client',
                        ]),
                        'is_client' => (bool) ($party['is_client'] ?? false),
                    ]);
                }
            }

            return $lockedRequest;
        });

        $this->loadResumeRelations($legalRequest);

        return response()->json([
            'message' => 'Draft autosaved successfully.',
            'legal_request' => LegalRequestResource::make($legalRequest)->resolve(),
        ]);
    }

    public function submit(
        Request $request,
        LegalRequest $legalRequest,
    ): JsonResponse {
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->status === 'active',
            403,
            'You are not allowed to submit this legal request.',
        );

        $legalRequest = DB::transaction(function () use ($legalRequest, $user): LegalRequest {
            $lockedRequest = LegalRequest::query()
                ->whereKey($legalRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $lockedRequest->client_user_id === $user->id,
                403,
                'You are not allowed to submit this legal request.',
            );

            abort_unless(
                $lockedRequest->status === 'draft',
                409,
                'Only draft legal requests can be submitted.',
            );

            Validator::make($lockedRequest->getAttributes(), [
                'description' => ['required', 'string'],
                'legal_category_id' => [
                    'required',
                    'uuid',
                    Rule::exists('legal_categories', 'id')->where('status', true),
                ],
                'province_id' => [
                    'required',
                    'integer',
                    Rule::exists('provinces', 'id'),
                ],
                'city_id' => [
                    'required',
                    'integer',
                    Rule::exists('cities', 'id')->where(
                        fn ($query) => $query->where(
                            'province_id',
                            $lockedRequest->province_id,
                        ),
                    ),
                ],
                'urgency' => [
                    'required',
                    Rule::in(['low', 'normal', 'high', 'urgent']),
                ],
                'service_intent' => [
                    'required',
                    Rule::in(LegalRequestServiceIntent::draftValues()),
                ],
            ])->validate();

            $lockedRequest->forceFill([
                'status' => 'submitted',
                'submitted_at' => now(),
            ])->save();

            return $lockedRequest->load('parties');
        });

        return response()->json([
            'message' => 'Legal request submitted successfully.',
            'legal_request' => LegalRequestResource::make($legalRequest)->resolve(),
        ]);
    }

    public function proposals(
        Request $request,
        LegalRequest $legalRequest,
    ): JsonResponse {
        $this->ensureOwner($request, $legalRequest);

        $proposals = $legalRequest->proposals()
            ->with(['lawyerProfile', 'negotiationThread'])
            ->with(['lawyerProfile', 'negotiation:id,public_id,status'])
            ->whereNotNull('lawyer_proposals.negotiation_id')
            ->where('lawyer_proposals.status', '!=', 'draft')
            ->latest('lawyer_proposals.submitted_at')
            ->get()
            ->map(fn ($proposal) => [
                'id' => $proposal->id,
                'public_id' => $proposal->public_id,
                'summary' => $proposal->summary,
                'service_scope' => $proposal->service_scope,
                'source' => $proposal->source,
                'proposed_fee_rial' => $proposal->proposed_fee_rial,
                'advance_payment_rial' => $proposal->advance_payment_rial,
                'estimated_days' => $proposal->estimated_days,
                'version_number' => $proposal->version_number,
                'service_scope' => $proposal->service_scope,
                'excluded_services' => $proposal->excluded_services,
                'payment_terms' => $proposal->payment_terms,
                'other_terms' => $proposal->other_terms,
                'terms_hash' => $proposal->terms_hash,
                'status' => $proposal->status,
                'negotiation_public_id' => $proposal->negotiationThread?->public_id,
                'submitted_at' => $proposal->submitted_at,
                'expires_at' => $proposal->expires_at,
                'negotiation' => $proposal->negotiation === null ? null : [
                    'public_id' => $proposal->negotiation->public_id,
                    'status' => $proposal->negotiation->status,
                ],
                'lawyer' => $proposal->lawyerProfile === null
                    ? null
                    : [
                        'public_id' => $proposal->lawyerProfile->public_id,
                        'full_name' => $proposal->lawyerProfile->full_name,
                        'average_rating' => $proposal->lawyerProfile->average_rating,
                        'rating_count' => $proposal->lawyerProfile->rating_count,
                    ],
            ]);

        return response()->json([
            'proposals' => $proposals,
        ]);
    }

    private function ensureOwner(
        Request $request,
        LegalRequest $legalRequest,
    ): void {
        $user = $request->user();

        abort_unless(
            $user instanceof User
            && $legalRequest->client_user_id === $user->id,
            403,
            'You are not allowed to view this legal request.',
        );
    }

    private function loadResumeRelations(LegalRequest $legalRequest): void
    {
        $legalRequest->load([
            'parties',
            'documents' => fn ($query) => $query
                ->where('status', '!=', 'archived')
                ->latest('created_at'),
            'documents.documentType',
            'documents.currentFile',
        ]);
    }
}
