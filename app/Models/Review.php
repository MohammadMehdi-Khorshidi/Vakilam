<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasUuids, SoftDeletes;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

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
        'engagement_id',
        'reviewer_user_id',
        'lawyer_profile_id',
        'rating',
        'body',
        'status',
        'published_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'published_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /** Engagement being reviewed. */
    public function engagement()
    {
        return $this->belongsTo(Engagement::class);
    }

    /** User who submitted this review. */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_user_id');
    }

    /** Lawyer profile being reviewed. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

}
