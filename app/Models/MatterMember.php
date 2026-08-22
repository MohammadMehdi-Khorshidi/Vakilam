<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MatterMember extends Model
{
    use HasUuids;

    /** This table does not contain Laravel's created_at / updated_at pair. */
    public $timestamps = false;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'legal_matter_id',
        'user_id',
        'member_role',
        'joined_at',
        'revoked_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /** Matter that owns this reserved metadata record. */
    public function legalMatter()
    {
        return $this->belongsTo(LegalMatter::class);
    }

    /** User represented by this membership record. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
