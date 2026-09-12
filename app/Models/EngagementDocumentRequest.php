<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EngagementDocumentRequest extends Model
{
    use HasUuids;

    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    protected $fillable = [
        'engagement_id',
        'document_id',
        'requested_by',
        'reviewed_by',
        'title',
        'instructions',
        'is_required',
        'status',
        'review_note',
        'uploaded_at',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'uploaded_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function engagement()
    {
        return $this->belongsTo(Engagement::class);
    }

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
