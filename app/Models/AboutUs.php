<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutUs extends Model
{
    /** Explicit table name because Laravel's convention would not match this table. */
    protected $table = 'about_us';

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'title',
        'description',
        'image',
        'status',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }

}
