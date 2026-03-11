<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    protected $fillable = [
        'academic_record_id', 'subject_id', 'subject_name', 'score', 'remarks',
    ];

    protected $casts = [
        'score' => 'decimal:2',
    ];

    public function academicRecord(): BelongsTo
    {
        return $this->belongsTo(AcademicRecord::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /** + computeRemarks() : String */
    public function computeRemarks(): string
    {
        $score = (float) $this->score;
        if ($score <= 1.0)       return 'Excellent';
        if ($score <= 1.5)       return 'Very Good';
        if ($score <= 2.0)       return 'Good';
        if ($score <= 2.5)       return 'Satisfactory';
        if ($score <= 3.0)       return 'Passed';
        return 'Failed';
    }

    /** + getScore() : double */
    public function getScore(): float
    {
        return (float) $this->score;
    }
}
