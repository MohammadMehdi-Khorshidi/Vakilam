<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClientProfile extends Model
{
    use HasUuids, SoftDeletes;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'user_id',
        'full_name',
        'national_code',
        'province_id',
        'city_id',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'deleted_at' => 'datetime',
        ];
    }

    /** User account that owns this client profile. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Province selected on the client profile. */
    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    /** City selected on the client profile. */
    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
