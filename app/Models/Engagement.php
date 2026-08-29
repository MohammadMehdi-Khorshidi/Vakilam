<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Engagement extends Model
{
    use HasUuids;

    /**
     * Generate UUIDs for both the internal primary key and the public identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'legal_request_id',
        'proposal_id',
        'client_user_id',
        'lawyer_profile_id',
        'status',
        'contract_due_at',
        'started_at',
        'ended_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'contract_due_at' => 'datetime',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    /** Legal request that produced this engagement. */
    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    /** Optional lawyer proposal selected for this engagement. */
    public function proposal()
    {
        return $this->belongsTo(LawyerProposal::class);
    }

    /** Client user in this engagement. */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    /** Lawyer profile in this engagement. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function confirmations()
    {
        return $this->hasMany(EngagementConfirmation::class);
    }

    /** Contract associated with this engagement; engagement_id is unique on contracts. */
    public function contract()
    {
        return $this->hasOne(Contract::class);
    }

    /** Legal matters that reference this engagement. */
    public function legalMatters()
    {
        return $this->hasMany(LegalMatter::class);
    }

    /** Reviews submitted for this engagement. */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
