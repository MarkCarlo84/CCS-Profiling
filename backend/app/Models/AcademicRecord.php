<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicRecord extends Model
{
    protected $fillable = [
        'student_id', 'school_year', 'semester', 'gpa',
    ];

    protected $casts = [
        'gpa' => 'decimal:2',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    /** + calculateGPA() : double */
    public function calculateGPA(): float
    {
        $grades = $this->grades;
        if ($grades->isEmpty()) return 0.0;
        $avg = $grades->avg('score');
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
}
