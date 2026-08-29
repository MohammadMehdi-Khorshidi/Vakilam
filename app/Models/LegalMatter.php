<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LegalMatter extends Model
{
    use HasUuids;

    public const ORIGIN_LAWYER_SELECTION = 'lawyer_selection';
    public const ORIGIN_AI_ASSISTANT = 'ai_assistant';
    public const ORIGIN_CONSULTATION = 'consultation';

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
        'source_legal_request_id',
        'origin_type',
        'originable_type',
        'originable_id',
        'engagement_id',
        'client_user_id',
        'title',
        'status',
        'opened_at',
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
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    /** Source legal request from which this matter was created. */
    public function sourceLegalRequest()
    {
        return $this->belongsTo(LegalRequest::class, 'source_legal_request_id');
    }

    /** Optional engagement associated with this matter. */
    public function engagement()
    {
        return $this->belongsTo(Engagement::class);
    }

    /** Business object whose successful payment formed this matter. */
    public function originable()
    {
        return $this->morphTo();
    }

    /** Client user who owns this matter. */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    /** Reserved membership metadata; client/lawyer authorization comes from client_user_id and engagement. */
    public function memberships()
    {
        return $this->hasMany(MatterMember::class);
    }

    /** Reserved member records; this relation is not an authorization source. */
    public function members()
    {
        return $this->belongsToMany(User::class, 'matter_members', 'legal_matter_id', 'user_id')
            ->withPivot(['id', 'member_role', 'joined_at', 'revoked_at']);
    }

    /** Tasks/actions tracked for this matter. */
    public function actions()
    {
        return $this->hasMany(MatterAction::class);
    }

    /** Timeline events recorded for this matter. */
    public function timelineEvents()
    {
        return $this->hasMany(MatterTimeline::class);
    }

    /** AI interactions linked to this matter. */
    public function aiInteractions()
    {
        return $this->hasMany(AiInteraction::class);
    }

    /** Documents linked to this matter. */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    /** Conversations linked to this matter. */
    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    /** Meetings linked to this matter. */
    public function meetings()
    {
        return $this->hasMany(Meeting::class);
    }

}
