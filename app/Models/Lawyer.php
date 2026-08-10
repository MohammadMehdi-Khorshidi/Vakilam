<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Lawyer extends Model
{
    // A lawyer belongs to one user.
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}