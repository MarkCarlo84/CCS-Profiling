<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    protected $fillable = [
        'faculty_id', 'title', 'report_type', 'subject_student',
        'content', 'status', 'report_date',
    ];

    // Valid statuses: draft (teacher only), submitted, confirmed
    const STATUS_DRAFT     = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_CONFIRMED = 'confirmed';

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }
}
