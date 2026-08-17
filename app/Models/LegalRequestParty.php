<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LegalRequestParty extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'legal_request_id',
        'party_role',
        'full_name',
        'relation_note',
        'is_client',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_client' => 'boolean',
        ];
    }

    /** Legal request that owns this party record. */
    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

}
