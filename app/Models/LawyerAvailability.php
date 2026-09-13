<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LawyerAvailability extends Model
{
    use HasUuids;

    protected $fillable = [
        'lawyer_profile_id',
        'starts_at',
        'ends_at',
        'allowed_durations',
        'status',
        'reserved_until',
        'consultation_id',
        'meeting_id',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'allowed_durations' => 'array',
            'reserved_until' => 'datetime',
        ];
    }

    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function meeting()
    {
        return $this->belongsTo(Meeting::class);
    }
}
