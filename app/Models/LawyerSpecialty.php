<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LawyerSpecialty extends Pivot
{
    use HasUuids;

    /** The pivot table uses a UUID primary key. */
    public $incrementing = false;

    protected $keyType = 'string';

    /** This table does not contain Laravel's created_at / updated_at pair. */
    public $timestamps = false;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'lawyer_profile_id',
        'specialty_id',
        'years_experience',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'years_experience' => 'integer',
        ];
    }

    /** Lawyer profile attached to this specialty record. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    /** Specialty attached to this lawyer record. */
    public function specialty()
    {
        return $this->belongsTo(Specialty::class);
    }

}
