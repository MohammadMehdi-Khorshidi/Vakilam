<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'code',
        'name_fa',
    ];

    // A role belongs to many users.
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles');
    }
}