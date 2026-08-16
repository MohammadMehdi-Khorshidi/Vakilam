<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $fillable = [
        'name',
        'province_id',
    ];


    // A city belongs to one province.
    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    
    // A city has many legal requests.
    public function legalRequests()
    {
        return $this->hasMany(LegalRequest::class);
    }
}