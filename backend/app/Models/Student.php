<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = [
        'student_id', 'department', 'first_name', 'middle_name', 'last_name',
        'age', 'guardian_name', 'date_of_birth', 'gender', 'address',
        'contact_number', 'email', 'enrollment_date', 'status',
    ];

    protected $casts = [
        'date_of_birth'   => 'date',
        'enrollment_date' => 'date',
        'age'             => 'integer',
    ];

    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class);
    }

    public function affiliations(): HasMany
    {
        return $this->hasMany(Affiliation::class);
    }

    public function academicRecords(): HasMany
    {
        return $this->hasMany(AcademicRecord::class);
    }

    public function skills(): HasMany
    {
        return $this->hasMany(Skill::class);
    }

    public function nonAcademicHistories(): HasMany
    {
        return $this->hasMany(NonAcademicHistory::class);
    }

    /** + getStudentID() : String */
    public function getStudentID(): string
    {
        return $this->student_id ?? (string) $this->id;
    }

    /** + getFullName() : String */
    public function getFullNameAttribute(): string
    {
        $middle = $this->middle_name ? " {$this->middle_name[0]}." : '';
        return "{$this->first_name}{$middle} {$this->last_name}";
    }

    /** + updateProfile() : void */
    public function updateProfile(array $data): void
    {
        $this->update($data);
    }

    /** + addViolation(violation: Violation) : void */
    public function addViolation(array $data): Violation
    {
        return $this->violations()->create($data);
    }

    /** + addAffiliation(affiliation: Affiliation) : void */
    public function addAffiliation(array $data): Affiliation
    {
        return $this->affiliations()->create($data);
    }

    /** + addSkill(skill: Skill) : void */
    public function addSkill(array $data): Skill
    {
        return $this->skills()->create($data);
    }

    /** + addAcademicRecord(record: AcademicRecord) : void */
    public function addAcademicRecord(array $data): AcademicRecord
    {
        return $this->academicRecords()->create($data);
    }
}
