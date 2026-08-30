<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NegotiationMessage extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    public function uniqueIds(): array
    {
        return ['id'];
    }

    protected $fillable = [
        'negotiation_id',
        'sender_user_id',
        'body',
    ];

    public function negotiation()
    {
        return $this->belongsTo(Negotiation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }
}
