<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientProfile extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'full_name',
        'national_code',
        'province_id',
        'city_id',
    ];

    
    //Get the user associated with the client profile
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}