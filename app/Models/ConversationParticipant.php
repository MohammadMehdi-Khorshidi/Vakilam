<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ConversationParticipant extends Model
{
    use HasUuids;

    /** This table does not contain Laravel's created_at / updated_at pair. */
    public $timestamps = false;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'conversation_id',
        'user_id',
        'joined_at',
        'left_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'left_at' => 'datetime',
        ];
    }

    /** Conversation containing this participant. */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /** User represented by this participant record. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
