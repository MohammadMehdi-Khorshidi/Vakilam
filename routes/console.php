<?php

use App\Models\Contract;
use App\Models\Engagement;
use App\Models\Invoice;
use App\Models\LawyerProposal;
use App\Models\Negotiation;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    LawyerProposal::query()
        ->where('status', LawyerProposal::STATUS_SUBMITTED)
        ->whereNotNull('expires_at')
        ->where('expires_at', '<=', now())
        ->with('negotiation')
        ->chunkById(100, function ($proposals): void {
            foreach ($proposals as $proposal) {
                DB::transaction(function () use ($proposal): void {
                    $locked = LawyerProposal::query()->whereKey($proposal->id)->lockForUpdate()->first();

                    if ($locked === null || $locked->status !== LawyerProposal::STATUS_SUBMITTED) {
                        return;
                    }

                    $locked->forceFill(['status' => LawyerProposal::STATUS_EXPIRED])->save();

                    $negotiation = Negotiation::query()
                        ->whereKey($locked->negotiation_id)
                        ->lockForUpdate()
                        ->first();

                    if ($negotiation?->status === Negotiation::STATUS_PROPOSAL_SUBMITTED) {
                        $negotiation->forceFill([
                            'status' => Negotiation::STATUS_CLOSED,
                            'closed_at' => now(),
                        ])->save();

                        if ($negotiation->distribution_id !== null) {
                            $negotiation->distribution()->update(['status' => 'expired']);
                        }
                    }
                });
            }
        });

    Engagement::query()
        ->where('status', 'pending_contract')
        ->whereNotNull('contract_due_at')
        ->where('contract_due_at', '<=', now())
        ->pluck('id')
        ->each(function (string $engagementId): void {
            DB::transaction(function () use ($engagementId): void {
                $engagement = Engagement::query()->whereKey($engagementId)->lockForUpdate()->first();

                if ($engagement === null
                    || $engagement->status !== 'pending_contract'
                    || $engagement->contract_due_at?->isFuture()) {
                    return;
                }

                $engagement->forceFill([
                    'status' => 'terminated',
                    'ended_at' => now(),
                ])->save();

                Contract::query()
                    ->where('engagement_id', $engagement->id)
                    ->whereIn('status', ['draft', 'review', 'signing', 'approved'])
                    ->update([
                        'status' => 'terminated',
                        'terminated_at' => now(),
                    ]);

                Invoice::query()
                    ->whereHas('contract', fn ($query) => $query->where('engagement_id', $engagement->id))
                    ->where('status', 'issued')
                    ->update(['status' => 'overdue']);
            });
        });
})->everyMinute();
