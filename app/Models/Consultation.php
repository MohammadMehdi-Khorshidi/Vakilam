<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasUuids;

    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    protected $fillable = [
        'legal_request_id',
        'client_user_id',
        'lawyer_profile_id',
        'status',
        'scheduled_start_at',
        'scheduled_end_at',
        'duration_minutes',
        'price_rial',
        'hold_expires_at',
        'completed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_start_at' => 'datetime',
            'scheduled_end_at' => 'datetime',
            'duration_minutes' => 'integer',
            'price_rial' => 'integer',
            'hold_expires_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function legalRequest() { return $this->belongsTo(LegalRequest::class); }
    public function client() { return $this->belongsTo(User::class, 'client_user_id'); }
    public function lawyerProfile() { return $this->belongsTo(LawyerProfile::class); }
    public function conversations() { return $this->hasMany(Conversation::class); }
    public function meetings() { return $this->hasMany(Meeting::class); }
}
