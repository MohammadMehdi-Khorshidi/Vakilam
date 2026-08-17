<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Document extends Model
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
        'legal_request_id',
        'legal_matter_id',
        'owner_user_id',
        'document_type_id',
        'title',
        'status',
        'current_file_id',
        'archived_at',
    ];

    /**
     * Cast database values to useful PHP types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
        ];
    }

    /** Optional legal request associated with this document. */
    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    /** Optional legal matter associated with this document. */
    public function legalMatter()
    {
        return $this->belongsTo(LegalMatter::class);
    }

    /** User who owns this document. */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    /** Optional document type used to classify this document. */
    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    /** Optional file currently selected as the active version. */
    public function currentFile()
    {
        return $this->belongsTo(StoredFile::class, 'current_file_id');
    }

    /** Version history for this document. */
    public function versions()
    {
        return $this->hasMany(DocumentVersion::class);
    }

}
