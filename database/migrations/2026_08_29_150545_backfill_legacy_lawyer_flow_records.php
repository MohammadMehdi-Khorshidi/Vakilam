<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (
            ! Schema::hasTable('lawyer_proposals')
            || ! Schema::hasTable('negotiations')
            || ! Schema::hasColumn('lawyer_proposals', 'negotiation_id')
        ) {
            return;
        }

        DB::transaction(function (): void {
            $proposals = DB::table('lawyer_proposals')
                ->whereNull('negotiation_id')
                ->whereNotNull('legal_request_id')
                ->orderBy('created_at')
                ->get();

            foreach ($proposals as $proposal) {
                $now = now();

                $distribution = $proposal->distribution_id === null
                    ? null
                    : DB::table('legal_request_distributions')
                        ->where('id', $proposal->distribution_id)
                        ->first();

                $source = match (true) {
                    $distribution?->source === 'lawyer_interest' => 'lawyer_interest',
                    $proposal->source === 'open' => 'lawyer_interest',
                    default => 'client_invite',
                };

                $openedAt = Carbon::parse(
                    $distribution?->responded_at
                        ?? $distribution?->sent_at
                        ?? $proposal->created_at
                        ?? $now,
                );

                $proposalStatus = $proposal->status;
                $negotiationStatus = 'closed';
                $distributionStatus = 'closed';
                $closedAt = $now;
                $expiresAt = $proposal->expires_at === null
                    ? null
                    : Carbon::parse($proposal->expires_at);

                $engagement = null;

                switch ($proposalStatus) {
                    case 'draft':
                        $negotiationStatus = 'active';
                        $distributionStatus = 'negotiating';
                        $closedAt = null;
                        break;

                    case 'submitted':
                    case 'shortlisted':
                        $submittedAt = Carbon::parse(
                            $proposal->submitted_at
                                ?? $proposal->created_at
                                ?? $now,
                        );

                        $expiresAt ??= $submittedAt->copy()->addHours(72);

                        if ($expiresAt->isPast()) {
                            $proposalStatus = 'expired';
                            $negotiationStatus = 'closed';
                            $distributionStatus = 'expired';
                            $closedAt = $expiresAt;
                        } else {
                            $negotiationStatus = 'proposal_submitted';
                            $distributionStatus = 'negotiating';
                            $closedAt = null;
                        }

                        break;

                    case 'selected':
                        $engagement = DB::table('engagements')
                            ->where('proposal_id', $proposal->id)
                            ->first();

                        if ($engagement === null) {
                            throw new RuntimeException(
                                "Selected legacy proposal [{$proposal->id}] has no engagement.",
                            );
                        }

                        $negotiationStatus = 'won';
                        $distributionStatus = 'selected';
                        $closedAt = Carbon::parse(
                            $engagement->created_at ?? $now,
                        );
                        break;

                    case 'withdrawn':
                        $negotiationStatus = 'closed';
                        $distributionStatus = 'closed';
                        $closedAt = Carbon::parse(
                            $proposal->submitted_at
                                ?? $proposal->created_at
                                ?? $now,
                        );
                        break;

                    case 'expired':
                        $negotiationStatus = 'closed';
                        $distributionStatus = 'expired';
                        $closedAt = $expiresAt ?? $now;
                        break;

                    case 'rejected':
                    case 'cancelled':
                        $negotiationStatus = 'cancelled';
                        $distributionStatus = 'cancelled';
                        $closedAt = $now;
                        break;

                    default:
                        throw new RuntimeException(
                            "Unsupported legacy proposal status [{$proposalStatus}].",
                        );
                }

                $negotiation = DB::table('negotiations')
                    ->where('legal_request_id', $proposal->legal_request_id)
                    ->where('lawyer_profile_id', $proposal->lawyer_profile_id)
                    ->first();

                if ($negotiation === null) {
                    $negotiationId = (string) Str::uuid7();

                    DB::table('negotiations')->insert([
                        'id' => $negotiationId,
                        'public_id' => (string) Str::uuid7(),
                        'legal_request_id' => $proposal->legal_request_id,
                        'lawyer_profile_id' => $proposal->lawyer_profile_id,
                        'distribution_id' => $proposal->distribution_id,
                        'source' => $source,
                        'status' => $negotiationStatus,
                        'opened_at' => $openedAt,
                        'closed_at' => $closedAt,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                } else {
                    $negotiationId = $negotiation->id;
                }

                $proposalUpdate = [
                    'negotiation_id' => $negotiationId,
                    'status' => $proposalStatus,
                ];

                if ($expiresAt !== null) {
                    $proposalUpdate['expires_at'] = $expiresAt;
                }

                DB::table('lawyer_proposals')
                    ->where('id', $proposal->id)
                    ->update($proposalUpdate);

                if ($distribution !== null) {
                    DB::table('legal_request_distributions')
                        ->where('id', $distribution->id)
                        ->update([
                            'source' => $source,
                            'status' => $distributionStatus,
                            'responded_at' => $distribution->responded_at
                                ?? $openedAt,
                        ]);
                }

                if (
                    $proposalStatus === 'selected'
                    && $engagement !== null
                    && $engagement->status === 'pending_contract'
                    && $engagement->contract_due_at === null
                ) {
                    DB::table('engagements')
                        ->where('id', $engagement->id)
                        ->update([
                            // Legacy selected engagements receive a fresh
                            // transition window instead of immediate termination.
                            'contract_due_at' => $now->copy()->addHours(48),
                        ]);
                }
            }
        });
    }

    public function down(): void
    {
        /*
         * Intentionally irreversible.
         *
         * Removing the generated Negotiation links or restoring expired
         * Proposal states would corrupt audit history after the new flow
         * has started using these records.
         */
    }
};
