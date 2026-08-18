<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LegalRequests\StoreLegalRequestRequest;
use App\Http\Resources\LegalRequestResource;
use App\Models\LegalRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class LegalRequestController extends Controller
{
    public function store(StoreLegalRequestRequest $request): JsonResponse
    {
        /** @var User $client */
        $client = $request->user();
        $data = $request->validated();

        $legalRequest = DB::transaction(function () use ($client, $data): LegalRequest {
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
                $legalRequest->parties()->create([
                    ...Arr::only($party, [
                        'party_role',
                        'full_name',
                        'relation_note',
                        'is_client',
                    ]),
                    'is_client' => (bool) ($party['is_client'] ?? false),
                ]);
            }

            return $legalRequest->load('parties');
        });

        return response()->json([
            'message' => 'Legal request created successfully.',
            'legal_request' => LegalRequestResource::make($legalRequest)->resolve(),
        ], 201);
    }

    public function submit(Request $request, LegalRequest $legalRequest): JsonResponse
    {
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
}
