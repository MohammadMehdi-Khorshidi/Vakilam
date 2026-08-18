<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LawyerProposal extends Model
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
        'distribution_id',
        'lawyer_profile_id',
        'summary',
        'proposed_fee_rial',
        'estimated_days',
        'status',
        'submitted_at',
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
            'proposed_fee_rial' => 'integer',
            'estimated_days' => 'integer',
            'submitted_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /** Distribution that this proposal answers. */
    public function distribution()
    {
        return $this->belongsTo(LegalRequestDistribution::class);
    }

    /** Lawyer profile that submitted this proposal. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    /** Engagements that reference this proposal. */
    public function engagements()
    {
        return $this->hasMany(Engagement::class, 'proposal_id');
    }

}
