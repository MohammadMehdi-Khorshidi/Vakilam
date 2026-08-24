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
        'status',
        'consultation_id',
        'meeting_id',
        'note',
        'reserved_until',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'reserved_until' => 'datetime',
        ];
    }

    /** Lawyer who published this availability slot. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    /** Consultation booked for this slot, if any. */
    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    /** Meeting linked to this slot, if any. */
    public function meeting()
    {
        return $this->belongsTo(Meeting::class);
    }
}