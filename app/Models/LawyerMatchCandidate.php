<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LawyerMatchCandidate extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'match_run_id',
        'lawyer_profile_id',
        'score',
        'rank_position',
        'explanation',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'decimal:3',
            'rank_position' => 'integer',
            'explanation' => 'array',
        ];
    }

    /** Matching run that generated this candidate. */
    public function matchRun()
    {
        return $this->belongsTo(LawyerMatchRun::class, 'match_run_id');
    }

    /** Lawyer profile represented by this candidate. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    /** Distribution records that reference this candidate. */
    public function distributions()
    {
        return $this->hasMany(LegalRequestDistribution::class, 'match_candidate_id');
    }

}
