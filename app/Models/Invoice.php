<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Invoice extends Model
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
        'contract_id',
        'client_user_id',
        'subtotal_rial',
        'discount_rial',
        'tax_rial',
        'total_rial',
        'status',
        'issued_at',
        'due_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal_rial' => 'integer',
            'discount_rial' => 'integer',
            'tax_rial' => 'integer',
            'total_rial' => 'integer',
            'issued_at' => 'datetime',
            'due_at' => 'datetime',
        ];
    }

    /** Contract under which this invoice was issued. */
    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    /** Client user responsible for this invoice. */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    /** Payment attempts recorded against this invoice. */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

}
