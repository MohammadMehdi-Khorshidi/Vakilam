<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AiInteraction extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

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
        'user_id',
        'legal_request_id',
        'legal_matter_id',
        'purpose',
        'provider',
        'model',
        'status',
        'input_summary',
        'output_text',
        'confidence',
        'requires_review',
        'started_at',
        'completed_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'confidence' => 'decimal:4',
            'requires_review' => 'boolean',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /** User associated with this AI interaction. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Optional legal request associated with this AI interaction. */
    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    /** Optional legal matter associated with this AI interaction. */
    public function legalMatter()
    {
        return $this->belongsTo(LegalMatter::class);
    }

}
