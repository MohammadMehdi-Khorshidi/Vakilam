<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LawyerProfile extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'public_id',
        'user_id',
        'full_name',
        'license_number',
        'bio',
        'verification_status',
        'average_rating',
        'rating_count',
        'is_available',
    ];


    //Get the user associated with the lawyer profile.
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}