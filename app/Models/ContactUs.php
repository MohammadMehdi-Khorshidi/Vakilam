<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactUs extends Model
{
    /** Explicit table name because Laravel's convention would not match this table. */
    protected $table = 'contact_us';

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'message',
        'response',
    ];

}
