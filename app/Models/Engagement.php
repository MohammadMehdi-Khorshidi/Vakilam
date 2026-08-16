<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Engagement extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'public_id',
        'legal_request_id',
        'proposal_id',
        'client_user_id',
        'lawyer_profile_id',
        'status',
        'started_at',
        'ended_at',
    ];

    // An engagement belongs to one legal request.
    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    // An engagement belongs to one client user.
    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    // An engagement belongs to one lawyer profile.
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }
}