<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LawyerMatchRun extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    protected $fillable = [
        'legal_request_id',
        'algorithm_version',
        'status',
        'candidates_count',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'candidates_count' => 'integer',
            'completed_at'     => 'datetime',
        ];
    }

    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    public function candidates()
    {
        return $this->hasMany(LawyerMatchCandidate::class, 'match_run_id');
    }
}
