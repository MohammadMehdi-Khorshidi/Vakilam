<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MatterTimeline extends Model
{
    use HasUuids;

    /** Explicit table name because Laravel's convention would not match this table. */
    protected $table = 'matter_timeline';

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'legal_matter_id',
        'actor_user_id',
        'event_type',
        'summary',
        'payload',
        'occurred_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    /** Matter whose timeline contains this event. */
    public function legalMatter()
    {
        return $this->belongsTo(LegalMatter::class);
    }

    /** Optional user who caused this event. */
    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

}
