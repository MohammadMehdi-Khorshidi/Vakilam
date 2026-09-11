<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use LogicException;

class Engagement extends Model
{
    use HasUuids;

    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    protected $fillable = [
        'legal_request_id',
        'proposal_id',
        'agreement_snapshot',
        'client_user_id',
        'lawyer_profile_id',
        'status',
        'contract_due_at',
        'started_at',
        'ended_at',
    ];

    protected static function booted(): void
    {
        static::updating(function (Engagement $engagement): void {
            if ($engagement->isDirty('proposal_id')) {
                throw new LogicException(
                    'The proposal behind an engagement is immutable.'
                );
            }

            if ($engagement->isDirty('agreement_snapshot')) {
                throw new LogicException(
                    'The accepted agreement snapshot is immutable.'
                );
            }
        });
    }

    protected function casts(): array
    {
        return [
            'agreement_snapshot' => 'array',
            'contract_due_at' => 'datetime',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    public function proposal()
    {
        return $this->belongsTo(LawyerProposal::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function confirmations()
    {
        return $this->hasMany(EngagementConfirmation::class);
    }

    public function contract()
    {
        return $this->hasOne(Contract::class);
    }

    public function legalMatter()
    {
        return $this->hasOne(LegalMatter::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
