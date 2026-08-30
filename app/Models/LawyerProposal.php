<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LawyerProposal extends Model
{
    use HasUuids;

    public const STATUS_DRAFT       = 'draft';
    public const STATUS_SUBMITTED   = 'submitted';
    public const STATUS_WITHDRAWN   = 'withdrawn';
    public const STATUS_COUNTERED   = 'countered';
    public const STATUS_ACCEPTED    = 'accepted';
    public const STATUS_REJECTED    = 'rejected';
    public const STATUS_CANCELLED   = 'cancelled';
    public const STATUS_EXPIRED     = 'expired';

    public const SOURCE_INVITED = 'invited';

    /**
     * Generate UUIDs for both the internal primary key and the public identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    protected $fillable = [
        'public_id',
        'legal_request_id',
        'negotiation_id',
        'distribution_id',
        'negotiation_thread_id',
        'parent_proposal_id',
        'version_number',
        'lawyer_profile_id',
        'summary',
        'service_scope',
        'cover_letter',
        'experience_highlight',
        'proposed_fee_rial',
        'advance_payment_rial',
        'estimated_days',
        'service_scope',
        'excluded_services',
        'payment_terms',
        'other_terms',
        'terms_hash',
        'status',
        'source',
        'submitted_at',
        'expires_at',
        'accepted_at',
        'rejected_at',
        'countered_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'proposed_fee_rial' => 'integer',
            'advance_payment_rial' => 'integer',
            'estimated_days'    => 'integer',
            'version_number' => 'integer',
            'service_scope' => 'array',
            'excluded_services' => 'array',
            'payment_terms' => 'array',
            'submitted_at'      => 'datetime',
            'expires_at'        => 'datetime',
            'accepted_at' => 'datetime',
            'rejected_at' => 'datetime',
            'countered_at' => 'datetime',
        ];
    }

    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    public function negotiation()
    {
        return $this->belongsTo(Negotiation::class);
    }

    public function distribution()
    {
        return $this->belongsTo(LegalRequestDistribution::class);
    }

    public function negotiationThread()
    {
        return $this->belongsTo(NegotiationThread::class);
    }

    public function parentProposal()
    {
        return $this->belongsTo(self::class, 'parent_proposal_id');
    }

    public function revisions()
    {
        return $this->hasMany(self::class, 'parent_proposal_id');
    }

    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function attachments()
    {
        return $this->hasMany(ProposalAttachment::class, 'proposal_id')->orderBy('sort_order');
    }

    public function engagements()
    {
        return $this->hasMany(Engagement::class, 'proposal_id');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED
            || (
                $this->status === self::STATUS_SUBMITTED
                && $this->expires_at
                && $this->expires_at->isPast()
            );
    }

    public function canonicalTerms(): array
    {
        return [
            'summary' => $this->summary,
            'total_fee_rial' => $this->proposed_fee_rial,
            'advance_payment_rial' => $this->advance_payment_rial,
            'estimated_days' => $this->estimated_days,
            'service_scope' => $this->service_scope ?? [],
            'excluded_services' => $this->excluded_services ?? [],
            'payment_terms' => $this->payment_terms ?? [],
            'other_terms' => $this->other_terms,
        ];
        $this->loadMissing('negotiation');

        if ($this->negotiation?->status !== Negotiation::STATUS_ACTIVE) {
            throw new \LogicException('Final proposal submission requires an active negotiation.');
        }

        $submittedAt = now();

        $this->update([
            'status'       => self::STATUS_SUBMITTED,
            'submitted_at' => $submittedAt,
            'expires_at'   => $submittedAt->copy()->addHours($expireHours),
        ]);

        $this->negotiation->forceFill([
            'status' => Negotiation::STATUS_PROPOSAL_SUBMITTED,
        ])->save();
    }

    public function markExpired(): void
    {
        if ($this->status === self::STATUS_SUBMITTED) {
            $this->update(['status' => self::STATUS_EXPIRED]);
        }
    }
}
