<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Consultation extends Model
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
        'client_user_id',
        'lawyer_profile_id',
        'status',
        'scheduled_start_at',
        'scheduled_end_at',
        'completed_at',
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
            'scheduled_start_at' => 'datetime',
            'scheduled_end_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /** Legal request that produced this consultation. */
    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    /** Client user who requested this consultation. */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    /** Optional lawyer assigned to this consultation. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    /** Conversations connected directly to this consultation. */
    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    /** Meetings connected directly to this consultation. */
    public function meetings()
    {
        return $this->hasMany(Meeting::class);
    }
}
