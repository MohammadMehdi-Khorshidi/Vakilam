<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalRequest extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'public_id',
        'client_user_id',
        'title',
        'description',
        'legal_category_id',
        'province_id',
        'city_id',
        'urgency',
        'service_intent',
        'status',
        'submitted_at',
        'cancelled_at',
    ];


    // A legal request belongs to one client user.
    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

  
    // A legal request belongs to one province.
    public function province()
    {
        return $this->belongsTo(Province::class);
    }
}