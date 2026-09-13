<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LawyerProfile extends Model
{
    use HasUuids, SoftDeletes;

    public function uniqueIds(): array { return ['id', 'public_id']; }

    protected $fillable = [
        'user_id', 'full_name', 'license_number', 'bio', 'verification_status',
        'average_rating', 'rating_count', 'is_available',
    ];

    protected function casts(): array
    {
        return [
            'average_rating' => 'decimal:2',
            'rating_count' => 'integer',
            'is_available' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function verifications() { return $this->hasMany(LawyerVerification::class); }
    public function serviceAreas() { return $this->hasMany(LawyerServiceArea::class); }
    public function lawyerSpecialties() { return $this->hasMany(LawyerSpecialty::class); }
    public function specialties()
    {
        return $this->belongsToMany(Specialty::class, 'lawyer_specialties')
            ->using(LawyerSpecialty::class)
            ->withPivot(['id', 'years_experience', 'created_at']);
    }
    public function matchCandidates() { return $this->hasMany(LawyerMatchCandidate::class); }
    public function distributions() { return $this->hasMany(LegalRequestDistribution::class); }
    public function proposals() { return $this->hasMany(LawyerProposal::class); }
    public function negotiations() { return $this->hasMany(Negotiation::class); }
    public function consultations() { return $this->hasMany(Consultation::class); }
    public function consultationRates() { return $this->hasMany(LawyerConsultationRate::class); }
    public function engagements() { return $this->hasMany(Engagement::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function settlements() { return $this->hasMany(Settlement::class); }
    public function availabilities() { return $this->hasMany(LawyerAvailability::class); }
}
