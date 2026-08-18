<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LegalCategory extends Model
{
    use HasUuids;

    /** This table does not contain Laravel's created_at / updated_at pair. */
    public $timestamps = false;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'code',
        'name',
        'status',
        'sort_order',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** Legal requests classified under this category. */
    public function legalRequests()
    {
        return $this->hasMany(LegalRequest::class);
    }

}
