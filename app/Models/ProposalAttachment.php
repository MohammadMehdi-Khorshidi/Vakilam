<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProposalAttachment extends Model
{
    use HasUuids;

    /** The table has created_at but no updated_at column. */
    public const UPDATED_AT = null;

    public const TYPE_RESUME      = 'resume';
    public const TYPE_SAMPLE_WORK = 'sample_work';
    public const TYPE_CERTIFICATE = 'certificate';
    public const TYPE_OTHER       = 'other';

    protected $fillable = [
        'proposal_id',
        'file_id',
        'attachment_type',
        'title',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function proposal()
    {
        return $this->belongsTo(LawyerProposal::class, 'proposal_id');
    }

    public function file()
    {
        return $this->belongsTo(File::class, 'file_id');
    }
}
