<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EngagementConfirmation extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    protected $fillable = [
        'engagement_id',
        'user_id',
        'role',
        'confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'confirmed_at' => 'datetime',
        ];
    }

    public function engagement()
    {
        return $this->belongsTo(Engagement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
