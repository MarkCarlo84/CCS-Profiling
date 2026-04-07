<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    /**
     * Allowed numeric grades (Philippine grading system).
     * Special status values: INC, IP, OD, UD are stored in remarks only.
     */
    const VALID_SCORES = [1.00, 1.25, 1.50, 2.00, 2.25, 2.50, 3.00, 5.00];

    /** Special non-numeric status values stored in remarks */
    const SPECIAL_REMARKS = ['INC', 'IP', 'OD', 'UD'];

    const PASSING_SCORE = 3.00;

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

    /**
     * Maps numeric score to grade description.
     * 1.00 = 96-100, 1.25 = 92-95, 1.50 = 88-91
     * 2.00 = 80-83,  2.25 = 75-79, 2.50 = 70-74
     * 3.00 = 60-64,  5.00 = 0-59 (Failed)
     */
    public function computeRemarks(): string
    {
        // If already a special status, return as-is
        if (in_array($this->remarks, self::SPECIAL_REMARKS)) {
            return $this->remarks;
        }

        $score = (float) $this->score;

        return match (true) {
            $score === 1.00 => 'Excellent (96-100)',
            $score === 1.25 => 'Superior (92-95)',
            $score === 1.50 => 'Very Good (88-91)',
            $score === 2.00 => 'Good (80-83)',
            $score === 2.25 => 'Satisfactory (75-79)',
            $score === 2.50 => 'Fairly Satisfactory (70-74)',
            $score === 3.00 => 'Passed (60-64)',
            $score === 5.00 => 'Failed (0-59)',
            default         => 'Invalid Grade',
        };
    }

    /** Whether the student passed this subject */
    public function isPassed(): bool
    {
        if (in_array($this->remarks, self::SPECIAL_REMARKS)) return false;
        return !is_null($this->score) && (float) $this->score <= self::PASSING_SCORE;
    }

    /** + getScore() : double */
    public function getScore(): float
    {
        return (float) $this->score;
    }
}
