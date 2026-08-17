<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class StoredFile extends Model
{
    use HasUuids, SoftDeletes;

    /** Explicit table name because Laravel's convention would not match this table. */
    protected $table = 'files';

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'disk',
        'path',
        'original_name',
        'mime_type',
        'size_bytes',
        'checksum_sha256',
        'status',
        'uploaded_by',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    /** Optional user who uploaded this file. */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /** Documents that currently point to this file. */
    public function currentForDocuments()
    {
        return $this->hasMany(Document::class, 'current_file_id');
    }

    /** Document-version records backed by this file. */
    public function documentVersions()
    {
        return $this->hasMany(DocumentVersion::class, 'file_id');
    }

}
