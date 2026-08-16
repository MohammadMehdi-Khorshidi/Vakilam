<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    protected $fillable = [
        'name',
    ];

    
    // A province has many legal requests.
    public function legalRequests()
    {
        return $this->hasMany(LegalRequest::class);
    }
}