<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = [
        'department_id', 'student_number', 'first_name', 'last_name', 'middle_name',
        'year_level', 'section', 'email', 'phone', 'birthdate', 'address',
        'gender', 'gpa', 'status', 'remarks'
    ];

    protected $casts = [
        'birthdate' => 'date',
        'gpa' => 'decimal:2',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function affiliations(): HasMany
    {
        return $this->hasMany(StudentAffiliation::class);
    }

    public function violations(): HasMany
    {
        return $this->hasMany(StudentViolation::class);
    }

    public function academicRecords(): HasMany
    {
        return $this->hasMany(StudentAcademicRecord::class);
    }

    public function nonAcademicRecords(): HasMany
    {
        return $this->hasMany(StudentNonAcademicRecord::class);
    }

    public function skills(): HasMany
    {
        return $this->hasMany(StudentSkill::class);
    }

    public function getFullNameAttribute(): string
    {
        $middle = $this->middle_name ? " {$this->middle_name[0]}." : '';
        return "{$this->first_name}{$middle} {$this->last_name}";
    }
}
