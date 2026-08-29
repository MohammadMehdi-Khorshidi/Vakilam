<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Negotiation extends Model
{
    use HasUuids;

    public const SOURCE_CLIENT_INVITE = 'client_invite';
    public const SOURCE_LAWYER_INTEREST = 'lawyer_interest';

    public const STATUS_ACTIVE = 'active';
    public const STATUS_PROPOSAL_SUBMITTED = 'proposal_submitted';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_WON = 'won';

    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    protected $fillable = [
        'legal_request_id',
        'lawyer_profile_id',
        'distribution_id',
        'source',
        'status',
        'opened_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function distribution()
    {
        return $this->belongsTo(LegalRequestDistribution::class);
    }

    public function messages()
    {
        return $this->hasMany(NegotiationMessage::class)->orderBy('created_at');
    }

    public function proposal()
    {
        return $this->hasOne(LawyerProposal::class);
    }
}
