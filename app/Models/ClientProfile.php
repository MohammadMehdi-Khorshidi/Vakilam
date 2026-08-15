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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}