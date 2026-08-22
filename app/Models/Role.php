<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Role extends Model
{
    use HasUuids;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'code',
        'name',
        'description',
        'is_system',
    ];

    /** Pivot records that assign this role to users. */
    public function assignments()
    {
        return $this->hasMany(UserRole::class);
    }

    /** Users assigned to this role through user_roles. */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles')
            ->using(UserRole::class)
            ->withPivot(['id', 'granted_at', 'revoked_at']);
    }

}
