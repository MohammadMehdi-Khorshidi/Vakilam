<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LegalRequest extends Model
{
    use HasUuids;

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
        'client_user_id',
        'title',
        'description',
        'legal_category_id',
        'province_id',
        'city_id',
        'urgency',
        'service_intent',
        'status',
        'submitted_at',
        'cancelled_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /** Client user who created this legal request. */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    /** Optional legal category assigned to this request. */
    public function legalCategory()
    {
        return $this->belongsTo(LegalCategory::class);
    }

    /** Optional province associated with this request. */
    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    /** Optional city associated with this request. */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    /** Parties registered on this legal request. */
    public function parties()
    {
        return $this->hasMany(LegalRequestParty::class);
    }

    /** Matching runs executed for this request. */
    public function matchRuns()
    {
        return $this->hasMany(LawyerMatchRun::class);
    }

    /** Distribution records created for candidate lawyers. */
    public function distributions()
    {
        return $this->hasMany(LegalRequestDistribution::class);
    }

    /** All lawyer proposals submitted for this request. */
    public function proposals()
    {
        return $this->hasMany(LawyerProposal::class);
    }

    /** Consultations opened from this request. */
    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    /** Engagements created from this request. */
    public function engagements()
    {
        return $this->hasMany(Engagement::class);
    }

    /** Legal matters whose source is this request. */
    public function legalMatters()
    {
        return $this->hasMany(LegalMatter::class, 'source_legal_request_id');
    }

    /** AI interactions linked to this request. */
    public function aiInteractions()
    {
        return $this->hasMany(AiInteraction::class);
    }

    /** Documents linked to this request. */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

}
