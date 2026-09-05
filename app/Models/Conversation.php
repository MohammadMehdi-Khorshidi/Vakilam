<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Conversation extends Model
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
        'legal_matter_id',
        'consultation_id',
        'status',
        'closed_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'closed_at' => 'datetime',
        ];
    }

    /** Optional legal matter associated with this conversation. */
    public function legalMatter()
    {
        return $this->belongsTo(LegalMatter::class);
    }

    /** Optional consultation associated with this conversation. */
    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    /** Participant records attached to this conversation. */
    public function participantRecords()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    /** Users participating in this conversation. */
    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['id', 'joined_at', 'left_at']);
    }

    /** Messages sent in this conversation. */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /** Most recent non-deleted message for conversation lists. */
    public function lastMessage()
    {
        return $this->hasOne(Message::class)
            ->where('status', '!=', 'deleted')
            ->latestOfMany('sent_at');
    }

}
