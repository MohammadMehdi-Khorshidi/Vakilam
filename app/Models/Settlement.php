<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Settlement extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

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
        'lawyer_profile_id',
        'amount_rial',
        'status',
        'paid_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_rial' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    /** Lawyer profile receiving this settlement. */
    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

}
