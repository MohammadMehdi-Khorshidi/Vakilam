<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Meeting extends Model
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
        'legal_matter_id',
        'consultation_id',
        'organizer_user_id',
        'meeting_mode',
        'status',
        'title',
        'starts_at',
        'ends_at',
        'meeting_url',
        'notes',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    /** Optional legal matter associated with this meeting. */
    public function legalMatter()
    {
        return $this->belongsTo(LegalMatter::class);
    }

    /** Optional consultation associated with this meeting. */
    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    /** User who organized this meeting. */
    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_user_id');
    }

}
