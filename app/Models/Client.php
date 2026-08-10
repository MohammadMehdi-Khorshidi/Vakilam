<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    // Allow user_id to be assigned when creating a client.
    protected $fillable = ['user_id'];
    // A client belongs to one user.
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}