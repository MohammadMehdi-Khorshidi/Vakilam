<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class LawyerProfile extends Model
{
    use HasUuids, SoftDeletes;

    /**
     * Generate UUIDs for both the internal primary key and the public identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'user_id',
        'full_name',
        'license_number',
        'bio',
        'verification_status',
        'average_rating',
        'rating_count',
        'is_available',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'average_rating' => 'decimal:2',
            'rating_count' => 'integer',
            'is_available' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    /** User account that owns this lawyer profile. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Verification attempts submitted for this lawyer. */
    public function verifications()
    {
        return $this->hasMany(LawyerVerification::class);
    }

    /** Geographic service areas offered by this lawyer. */
    public function serviceAreas()
    {
        return $this->hasMany(LawyerServiceArea::class);
    }

    /** Lawyer-specialty assignment records. */
    public function lawyerSpecialties()
    {
        return $this->hasMany(LawyerSpecialty::class);
    }

    /** Specialties advertised by this lawyer. */
    public function specialties()
    {
        return $this->belongsToMany(Specialty::class, 'lawyer_specialties')
            ->using(LawyerSpecialty::class)
            ->withPivot(['id', 'years_experience', 'created_at']);
    }

    /** Matching candidates generated for this lawyer. */
    public function matchCandidates()
    {
        return $this->hasMany(LawyerMatchCandidate::class);
    }

    /** Legal-request distributions sent to this lawyer. */
    public function distributions()
    {
        return $this->hasMany(LegalRequestDistribution::class);
    }

    /** Proposals submitted by this lawyer. */
    public function proposals()
    {
        return $this->hasMany(LawyerProposal::class);
    }

    /** Consultations assigned to this lawyer. */
    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    /** Engagements assigned to this lawyer. */
    public function engagements()
    {
        return $this->hasMany(Engagement::class);
    }

    /** Reviews written about this lawyer. */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /** Financial settlements payable to this lawyer. */
    public function settlements()
    {
        return $this->hasMany(Settlement::class);
    }
}
