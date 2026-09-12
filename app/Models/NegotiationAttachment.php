<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NegotiationAttachment extends Model
{
    use HasUuids;

    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    protected $fillable = [
        'negotiation_id',
        'sender_user_id',
        'disk',
        'path',
        'original_name',
        'mime_type',
        'size_bytes',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function negotiation()
    {
        return $this->belongsTo(Negotiation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }
}
