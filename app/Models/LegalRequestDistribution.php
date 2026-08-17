<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LegalRequestDistribution extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'legal_request_id',
        'lawyer_profile_id',
        'match_candidate_id',
        'status',
        'sent_at',
        'viewed_at',
        'expires_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'viewed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /** Legal request distributed to a lawyer. */
    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    /** Lawyer profile that received this distribution. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    /** Optional matching candidate that produced this distribution. */
    public function matchCandidate()
    {
        return $this->belongsTo(LawyerMatchCandidate::class);
    }

    /** Single proposal attached to this distribution. */
    public function proposal()
    {
        return $this->hasOne(LawyerProposal::class, 'distribution_id');
    }

}
