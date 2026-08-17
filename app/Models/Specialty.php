<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Specialty extends Model
{
    use HasUuids;

    /** This table does not contain Laravel's created_at / updated_at pair. */
    public $timestamps = false;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'code',
        'name',
        'status',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }

    /** Lawyer-specialty assignment records. */
    public function lawyerSpecialties()
    {
        return $this->hasMany(LawyerSpecialty::class);
    }

    /** Lawyers that advertise this specialty. */
    public function lawyerProfiles()
    {
        return $this->belongsToMany(LawyerProfile::class, 'lawyer_specialties')
            ->using(LawyerSpecialty::class)
            ->withPivot(['id', 'years_experience', 'created_at']);
    }

}
