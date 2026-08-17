<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserRole extends Pivot
{
    use HasUuids;

    /** The pivot table uses a UUID primary key. */
    public $incrementing = false;

    protected $keyType = 'string';

    /** This table does not contain Laravel's created_at / updated_at pair. */
    public $timestamps = false;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'user_id',
        'role_id',
        'granted_at',
        'revoked_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'granted_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /** User that owns this role assignment. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Role referenced by this assignment. */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

}
