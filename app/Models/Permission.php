<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasUuids;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'code',
        'name',
        'group_code',
        'description',
        'is_sensitive',
    ];

    /** Cast database values to useful PHP types. */
    protected $casts = [
        'is_sensitive' => 'boolean',
    ];

    /**
     * Roles that have this permission.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }
}