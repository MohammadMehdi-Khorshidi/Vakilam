<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'public_id',
        'legal_request_id',
        'client_user_id',
        'lawyer_profile_id',
        'status',
        'scheduled_start_at',
        'scheduled_end_at',
        'completed_at',
        'notes',
    ];

    // A consultation belongs to one legal request.
    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    // A consultation belongs to one client user.
    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    // A consultation belongs to one lawyer profile.
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }
}