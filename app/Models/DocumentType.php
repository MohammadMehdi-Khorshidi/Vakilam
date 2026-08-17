<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DocumentType extends Model
{
    use HasUuids;

    /** This table does not contain Laravel's created_at / updated_at pair. */
    public $timestamps = false;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'code',
        'name',
        'status',
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
        ];
    }

    /** Documents classified as this type. */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

}
