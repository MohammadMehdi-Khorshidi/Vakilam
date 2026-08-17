<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Message extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /**
     * Generate UUIDs for both the internal primary key and the public identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'conversation_id',
        'sender_user_id',
        'body',
        'status',
        'sent_at',
        'edited_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'edited_at' => 'datetime',
        ];
    }

    /** Conversation that contains this message. */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /** User who sent this message. */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

}
