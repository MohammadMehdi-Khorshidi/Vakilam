<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LawyerMatchCandidate extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    protected $fillable = [
        'match_run_id',
        'lawyer_profile_id',
        'score',
        'rank_position',
        'explanation',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score'         => 'decimal:3',
            'rank_position' => 'integer',
            'explanation'   => 'array',
        ];
    }

    public function matchRun()
    {
        return $this->belongsTo(LawyerMatchRun::class, 'match_run_id');
    }

    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function distributions()
    {
        return $this->hasMany(LegalRequestDistribution::class, 'match_candidate_id');
    }
}
