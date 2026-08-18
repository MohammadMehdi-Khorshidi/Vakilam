<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DocumentVersion extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    /** Attributes that may be mass assigned. */
    protected $fillable = [
        'document_id',
        'file_id',
        'version_number',
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
            'version_number' => 'integer',
        ];
    }

    /** Document that owns this version. */
    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    /** Stored file containing this version's bytes. */
    public function file()
    {
        return $this->belongsTo(StoredFile::class, 'file_id');
    }

    /** User who uploaded this version. */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

}
