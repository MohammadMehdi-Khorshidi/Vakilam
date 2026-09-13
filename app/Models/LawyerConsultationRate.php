<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LawyerConsultationRate extends Model
{
    use HasUuids;

    protected $fillable = [
        'lawyer_profile_id',
        'duration_minutes',
        'price_rial',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'price_rial' => 'integer',
        ];
    }

    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }
}
