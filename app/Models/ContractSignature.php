<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ContractSignature extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'contract_version_id',
        'signer_user_id',
        'signature_method',
        'status',
        'signed_at',
        'evidence',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'signed_at' => 'datetime',
            'evidence' => 'array',
        ];
    }

    /** Contract version being signed. */
    public function contractVersion()
    {
        return $this->belongsTo(ContractVersion::class);
    }

    /** User who signs this version. */
    public function signer()
    {
        return $this->belongsTo(User::class, 'signer_user_id');
    }

}
