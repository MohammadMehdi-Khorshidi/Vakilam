<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ContractVersion extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'contract_id',
        'version_number',
        'terms_text',
        'terms_hash',
        'created_by',
        'status',
        'issued_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'version_number' => 'integer',
            'issued_at' => 'datetime',
        ];
    }

    /** Contract that owns this version. */
    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    /** User who created this version. */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Signatures collected for this contract version. */
    public function signatures()
    {
        return $this->hasMany(ContractSignature::class);
    }

}
