<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'name',
        'province_id',
    ];

    /** Province that contains this city. */
    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    /** Client profiles located in this city. */
    public function clientProfiles()
    {
        return $this->hasMany(ClientProfile::class);
    }

    /** Lawyer service areas configured for this city. */
    public function lawyerServiceAreas()
    {
        return $this->hasMany(LawyerServiceArea::class);
    }

    /** Legal requests associated with this city. */
    public function legalRequests()
    {
        return $this->hasMany(LegalRequest::class);
    }

}
