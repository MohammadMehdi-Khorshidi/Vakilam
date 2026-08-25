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
    public const STATUS_SHORTLISTED = 'shortlisted';
    public const STATUS_SELECTED    = 'selected';
    public const STATUS_REJECTED    = 'rejected';
    public const STATUS_EXPIRED     = 'expired';

    public const SOURCE_MATCHED = 'matched';
    public const SOURCE_OPEN    = 'open';

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
        'distribution_id',
        'lawyer_profile_id',
        'summary',
        'cover_letter',
        'experience_highlight',
        'proposed_fee_rial',
        'estimated_days',
        'status',
        'source',
        'submitted_at',
        'expires_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'proposed_fee_rial' => 'integer',
            'estimated_days'    => 'integer',
            'submitted_at'      => 'datetime',
            'expires_at'        => 'datetime',
        ];
    }

    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    public function distribution()
    {
        return $this->belongsTo(LegalRequestDistribution::class);
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

    public function isOpenProposal(): bool
    {
        return $this->source === self::SOURCE_OPEN;
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED
            || (
                $this->status === self::STATUS_SUBMITTED
                && $this->expires_at
                && $this->expires_at->isPast()
            );
    }

    public function markSubmitted(int $expireHours = 72): void
    {
        $this->update([
            'status'       => self::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'expires_at'   => now()->addHours($expireHours),
        ]);
    }

    public function markExpired(): void
    {
        if ($this->status === self::STATUS_SUBMITTED) {
            $this->update(['status' => self::STATUS_EXPIRED]);
        }
    }
}
