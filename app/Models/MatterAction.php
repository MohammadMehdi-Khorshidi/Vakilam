<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MatterAction extends Model
{
    use HasUuids;

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
        'assigned_user_id',
        'title',
        'description',
        'status',
        'priority',
        'due_at',
        'completed_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /** Matter that owns this action. */
    public function legalMatter()
    {
        return $this->belongsTo(LegalMatter::class);
    }

    /** Optional user currently assigned to this action. */
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

}
