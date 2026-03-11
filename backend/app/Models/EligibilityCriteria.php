<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EligibilityCriteria extends Model
{
    protected $table = 'eligibility_criteria';

    protected $fillable = [
        'criteria_id', 'minimum_gpa', 'required_skill',
        'required_affiliation_type', 'max_allowed_violations',
    ];

    protected $casts = [
        'minimum_gpa'          => 'decimal:2',
        'max_allowed_violations' => 'integer',
    ];

    /**
     * + evaluate(student: Student) : boolean
     * Checks whether a given student meets this eligibility criteria.
     */
    public function evaluate(Student $student): bool
    {
        // Check GPA (lower is better in Philippine grading)
        $academicRecords = $student->academicRecords;
        if ($academicRecords->isNotEmpty()) {
            $avgGpa = $academicRecords->avg('gpa');
            if ($avgGpa === null || $avgGpa > (float) $this->minimum_gpa) {
                return false;
            }
        }

        // Check required skill
        if ($this->required_skill) {
            $hasSkill = $student->skills()
                ->where('skill_name', 'like', "%{$this->required_skill}%")
                ->exists();
            if (!$hasSkill) return false;
        }

        // Check required affiliation type
        if ($this->required_affiliation_type) {
            $hasAffiliation = $student->affiliations()
                ->where('type', $this->required_affiliation_type)
                ->exists();
            if (!$hasAffiliation) return false;
        }

        // Check max allowed violations
        $violationCount = $student->violations()->count();
        if ($violationCount > $this->max_allowed_violations) {
            return false;
        }

        return true;
    }
}
