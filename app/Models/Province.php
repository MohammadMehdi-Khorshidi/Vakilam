<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'name',
    ];

    /** Cities that belong to this province. */
    public function cities()
    {
        return $this->hasMany(City::class);
    }

    /** Client profiles located in this province. */
    public function clientProfiles()
    {
        return $this->hasMany(ClientProfile::class);
    }

    /** Lawyer service areas configured for this province. */
    public function lawyerServiceAreas()
    {
        return $this->hasMany(LawyerServiceArea::class);
    }

    /** Legal requests associated with this province. */
    public function legalRequests()
    {
        return $this->hasMany(LegalRequest::class);
    }
}