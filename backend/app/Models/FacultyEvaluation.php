<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacultyEvaluation extends Model
{
    protected $fillable = [
        'faculty_id', 'student_id',
        'teaching_effectiveness', 'communication',
        'professionalism', 'subject_mastery', 'student_engagement',
        'comments', 'school_year', 'semester',
    ];

    protected $casts = [
        'teaching_effectiveness' => 'integer',
        'communication'          => 'integer',
        'professionalism'        => 'integer',
        'subject_mastery'        => 'integer',
        'student_engagement'     => 'integer',
    ];

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function getAverageRatingAttribute(): float
    {
        $scores = array_filter([
            $this->teaching_effectiveness,
            $this->communication,
            $this->professionalism,
            $this->subject_mastery,
            $this->student_engagement,
        ]);
        return count($scores) ? round(array_sum($scores) / count($scores), 2) : 0;
    }
}
