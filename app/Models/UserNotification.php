<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserNotification extends Model
{
    use HasUuids;

    /** Explicit table name because Laravel's convention would not match this table. */
    protected $table = 'notifications';

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'user_id',
        'channel',
        'type',
        'title',
        'body',
        'data',
        'status',
        'read_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data' => 'array',
            'read_at' => 'datetime',
        ];
    }

    /** User who owns this application notification. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
