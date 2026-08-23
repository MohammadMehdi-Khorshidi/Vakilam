<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Policy extends Model
{
    use HasUuids, HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'type',
        'version',
        'title',
        'content',
        'effective_from',
        'is_current',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'effective_from' => 'datetime',
        'is_current'     => 'boolean',
        'published_at'   => 'datetime',
        'created_at'     => 'datetime',
        'updated_at'     => 'datetime',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function acceptances(): HasMany
    {
        return $this->hasMany(UserPolicyAcceptance::class, 'policy_id');
    }

    // Scopes
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at');
    }

    public function scopeEffective($query)
    {
        return $query->where('effective_from', '<=', now());
    }

    // Helpers
    public static function currentOfType(string $type): ?self
    {
        return static::ofType($type)->current()->first();
    }
}
