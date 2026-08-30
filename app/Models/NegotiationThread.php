<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NegotiationThread extends Model
{
    use HasUuids;

    public const STATUS_OPEN = 'open';
    public const STATUS_AGREED = 'agreed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_CLOSED = 'closed';

    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    protected $fillable = [
        'distribution_id',
        'status',
        'started_at',
        'agreed_at',
        'cancelled_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'agreed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function distribution()
    {
        return $this->belongsTo(LegalRequestDistribution::class);
    }

    public function messages()
    {
        return $this->hasMany(NegotiationMessage::class);
    }

    public function proposals()
    {
        return $this->hasMany(LawyerProposal::class);
    }

    public function acceptedProposal()
    {
        return $this->hasOne(LawyerProposal::class)
            ->where('status', LawyerProposal::STATUS_ACCEPTED);
    }
}
