<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LawyerServiceArea extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'lawyer_profile_id',
        'province_id',
        'city_id',
    ];

    /** Lawyer profile that offers services in this area. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    /** Province covered by this service area. */
    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    /** Optional city covered by this service area; null means the whole province. */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

}
