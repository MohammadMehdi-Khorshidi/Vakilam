<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LawyerVerification extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'lawyer_profile_id',
        'status',
        'submitted_data',
        'review_note',
        'reviewed_by',
        'submitted_at',
        'reviewed_at',
    ];

    // A lawyer verification belongs to one lawyer profile.
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    // A lawyer verification is reviewed by one user.
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}