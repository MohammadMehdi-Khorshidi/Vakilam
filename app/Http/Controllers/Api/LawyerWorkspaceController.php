<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Http\Resources\EngagementResource;
use App\Models\Engagement;
use App\Models\LawyerProposal;
use App\Models\LegalRequestDistribution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LawyerWorkspaceController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    public function opportunities(Request $request): JsonResponse
    {
        $lawyer = $this->authenticatedApprovedLawyer($request);
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 50);

        $paginator = LegalRequestDistribution::query()
            ->where('lawyer_profile_id', $lawyer->id)
            ->with([
                'legalRequest:id,public_id,title,description,legal_category_id,province_id,city_id,urgency,service_intent,status,submitted_at',
                'legalRequest.legalCategory:id,code,name',
                'legalRequest.province:id,name',
                'legalRequest.city:id,province_id,name',
                'proposal:id,public_id,distribution_id,negotiation_id,status,submitted_at,expires_at',
                'negotiation:id,public_id,distribution_id,status,opened_at,closed_at',
            ])
            ->latest('sent_at')
            ->paginate($perPage);

        return response()->json([
            'data' => collect($paginator->items())->map(fn (LegalRequestDistribution $distribution): array => [
                'distribution_id' => $distribution->id,
                'source' => $distribution->source,
                'status' => $distribution->status,
                'sent_at' => $distribution->sent_at,
                'viewed_at' => $distribution->viewed_at,
                'expires_at' => $distribution->expires_at,
                'legal_request' => $distribution->legalRequest === null ? null : [
                    'public_id' => $distribution->legalRequest->public_id,
                    'title' => $distribution->legalRequest->title,
                    'description' => $distribution->legalRequest->description,
                    'urgency' => $distribution->legalRequest->urgency,
                    'service_intent' => $distribution->legalRequest->service_intent,
                    'status' => $distribution->legalRequest->status,
                    'submitted_at' => $distribution->legalRequest->submitted_at,
                    'category' => $distribution->legalRequest->legalCategory === null ? null : [
                        'code' => $distribution->legalRequest->legalCategory->code,
                        'name' => $distribution->legalRequest->legalCategory->name,
                    ],
                    'province' => $distribution->legalRequest->province?->name,
                    'city' => $distribution->legalRequest->city?->name,
                ],
                'negotiation' => $distribution->negotiation === null ? null : [
                    'public_id' => $distribution->negotiation->public_id,
                    'status' => $distribution->negotiation->status,
                    'opened_at' => $distribution->negotiation->opened_at,
                    'closed_at' => $distribution->negotiation->closed_at,
                ],
                'proposal' => $distribution->proposal === null ? null : [
                    'public_id' => $distribution->proposal->public_id,
                    'status' => $distribution->proposal->status,
                    'submitted_at' => $distribution->proposal->submitted_at,
                    'expires_at' => $distribution->proposal->expires_at,
                ],
            ])->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function proposals(Request $request): JsonResponse
    {
        $lawyer = $this->authenticatedApprovedLawyer($request);
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 50);

        $paginator = LawyerProposal::query()
            ->where('lawyer_profile_id', $lawyer->id)
            ->with([
                'legalRequest:id,public_id,title,status',
                'negotiation:id,public_id,status',
                'distribution:id,legal_request_id,status',
                'distribution.legalRequest:id,public_id,title,status',
            ])
            ->latest('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => collect($paginator->items())->map(function (LawyerProposal $proposal): array {
                $legalRequest = $proposal->legalRequest ?? $proposal->distribution?->legalRequest;

                return [
                    'public_id' => $proposal->public_id,
                    'distribution_id' => $proposal->distribution_id,
                    'negotiation' => $proposal->negotiation === null ? null : [
                        'public_id' => $proposal->negotiation->public_id,
                        'status' => $proposal->negotiation->status,
                    ],
                    'source' => $proposal->source,
                    'status' => $proposal->status,
                    'summary' => $proposal->summary,
                    'service_scope' => $proposal->service_scope,
                    'proposed_fee_rial' => $proposal->proposed_fee_rial,
                    'estimated_days' => $proposal->estimated_days,
                    'submitted_at' => $proposal->submitted_at,
                    'expires_at' => $proposal->expires_at,
                    'legal_request' => $legalRequest === null ? null : [
                        'public_id' => $legalRequest->public_id,
                        'title' => $legalRequest->title,
                        'status' => $legalRequest->status,
                    ],
                ];
            })->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function engagements(Request $request): JsonResponse
    {
        $lawyer = $this->authenticatedApprovedLawyer($request);
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 50);

        $paginator = Engagement::query()
            ->where('lawyer_profile_id', $lawyer->id)
            ->with([
                'legalRequest:id,public_id,title,status',
                'proposal:id,public_id,negotiation_id,status,summary,service_scope,proposed_fee_rial,estimated_days',
                'proposal.negotiation:id,public_id,status',
                'lawyerProfile:id,public_id,full_name,verification_status',
                'client:id,public_id,name,last_name',
                'contract:id,public_id,engagement_id,status',
            ])
            ->latest('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => collect($paginator->items())
                ->map(fn (Engagement $engagement): array => EngagementResource::make($engagement)->resolve())
                ->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    private function authenticatedApprovedLawyer(Request $request)
    {
        $lawyer = $this->authenticatedLawyerProfile($request);

        abort_unless(
            $lawyer->verification_status === 'approved',
            403,
            'Only approved lawyers may use the lawyer workspace.',
        );

        return $lawyer;
    }
}
