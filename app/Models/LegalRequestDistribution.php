<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LegalRequestDistribution extends Model
{
    use HasUuids;

    public const STATUS_SENT = 'sent';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_SELECTED = 'selected';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_CLOSED = 'closed';

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    protected $fillable = [
        'legal_request_id',
        'lawyer_profile_id',
        'match_candidate_id',
        'source',
        'status',
        'sent_at',
        'viewed_at',
        'responded_at',
        'expires_at',
        'closed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'viewed_at' => 'datetime',
            'responded_at' => 'datetime',
            'expires_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function matchCandidate()
    {
        return $this->belongsTo(LawyerMatchCandidate::class);
    }

    public function negotiation()
    {
        return $this->hasOne(Negotiation::class, 'distribution_id');
    }

    public function proposal()
    {
        return $this->hasMany(LawyerProposal::class, 'distribution_id');
    }

    public function negotiationThread()
    {
        return $this->hasOne(NegotiationThread::class, 'distribution_id');
    }
}
