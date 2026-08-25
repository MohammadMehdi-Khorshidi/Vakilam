<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LegalRequestDistribution extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

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
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sent_at'    => 'datetime',
            'viewed_at'  => 'datetime',
            'expires_at' => 'datetime',
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

    public function proposal()
    {
        return $this->hasOne(LawyerProposal::class, 'distribution_id');
    }
}
