<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Contract extends Model
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
        'engagement_id',
        'status',
        'current_version',
        'effective_at',
        'terminated_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_version' => 'integer',
            'effective_at' => 'datetime',
            'terminated_at' => 'datetime',
        ];
    }

    /** Engagement governed by this contract. */
    public function engagement()
    {
        return $this->belongsTo(Engagement::class);
    }

    /** All versions created for this contract. */
    public function versions()
    {
        return $this->hasMany(ContractVersion::class);
    }

    /** Invoices issued under this contract. */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

}
