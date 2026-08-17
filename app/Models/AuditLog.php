<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AuditLog extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'actor_user_id',
        'action',
        'target_type',
        'target_id',
        'ip_address',
        'metadata',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /** Optional user responsible for this audit entry. */
    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    /** Polymorphic target identified by target_type and target_id. */
    public function target()
    {
        return $this->morphTo();
    }

}
