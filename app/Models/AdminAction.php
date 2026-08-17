<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AdminAction extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'admin_user_id',
        'action_type',
        'target_type',
        'target_id',
        'reason',
        'metadata',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /** Admin user who performed this action. */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    /** Polymorphic target identified by target_type and target_id. */
    public function target()
    {
        return $this->morphTo();
    }

}
