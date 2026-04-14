<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Subject;

class Faculty extends Model
{
    protected $fillable = [
        'faculty_id', 'first_name', 'last_name', 'department',
        'position', 'email', 'contact_number',
    ];

    public function evaluations(): HasMany
    {
        return $this->hasMany(FacultyEvaluation::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'faculty_subjects')
            ->withPivot('school_year', 'semester', 'section')
            ->withTimestamps();
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * + createReport(criteria: EligibilityCriteria) : Report
     * Returns list of students who pass the given criteria.
     */
    public function createReport(EligibilityCriteria $criteria): array
    {
        $students = Student::with(['affiliations', 'violations', 'skills', 'academicRecords'])->get();
        $eligible = $students->filter(fn($s) => $criteria->evaluate($s));
        return [
            'criteria' => $criteria->toArray(),
            'faculty'  => $this->full_name,
            'eligible_students' => $eligible->values()->toArray(),
        ];
    }

    /**
     * + evaluateStudent(student: Student) : void
     * Evaluates a student by checking eligibility across all criteria.
     */
    public function evaluateStudent(Student $student): array
    {
        $criteria = EligibilityCriteria::all();
        $results = [];
        foreach ($criteria as $c) {
            $results[] = [
                'criteria_id' => $c->id,
                'passed'      => $c->evaluate($student),
            ];
        }
        return $results;
    }

    /**
     * + recordViolation(student: Student, violation: Violation) : void
     */
    public function recordViolation(Student $student, array $violationData): Violation
    {
        return $student->violations()->create($violationData);
    }

    /**
     * + updateStudentRecord(student: Student) : void
     */
    public function updateStudentRecord(Student $student, array $data): Student
    {
        $student->update($data);
        return $student->fresh();
    }
}
