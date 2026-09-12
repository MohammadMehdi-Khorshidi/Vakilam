<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

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

    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
        ];
    }

    public function legalRequest()
    {
        return $this->belongsTo(LegalRequest::class);
    }

    public function legalMatter()
    {
        return $this->belongsTo(LegalMatter::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function currentFile()
    {
        return $this->belongsTo(StoredFile::class, 'current_file_id');
    }

    public function versions()
    {
        return $this->hasMany(DocumentVersion::class);
    }
}
