<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicRecord extends Model
{
    protected $fillable = [
        'student_id', 'school_year', 'semester', 'year_level', 'gpa',
    ];

    protected $casts = [
        'gpa'        => 'decimal:2',
        'year_level' => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    /**
     * Recalculate GPA using only finalized numeric grades.
     * Skips INC, IP, OD, UD and null scores.
     */
    public function calculateGPA(): float
    {
        $finalized = $this->grades()
            ->whereNotNull('score')
            ->whereNotIn('remarks', Grade::SPECIAL_REMARKS)
            ->get();

        if ($finalized->isEmpty()) {
            $this->update(['gpa' => null]);
            return 0.0;
        }

        $avg = $finalized->avg('score');
        $this->update(['gpa' => $avg]);
        return (float) $avg;
    }

    /** + addGrade(grade: Grade) : void */
    public function addGrade(Grade $grade): void
    {
        $grade->update(['academic_record_id' => $this->id]);
        $this->calculateGPA();
    }

    /** + getGPA() : double */
    public function getGPA(): float
    {
        return (float) $this->gpa;
    }

    /**
     * Whether all subjects in this semester are passed.
     * Used for auto-promotion logic.
     */
    public function allPassed(): bool
    {
        $grades = $this->grades;
        if ($grades->isEmpty()) return false;

        return $grades->every(fn($g) => $g->isPassed());
    }
}
