<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    protected $fillable = [
        'subject_code', 'subject_name', 'units', 'year_level', 'semester', 'pre_requisite', 'program',
    ];

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function faculties()
    {
        return $this->belongsToMany(Faculty::class, 'faculty_subjects')
            ->withPivot('school_year', 'semester')
            ->withTimestamps();
    }

    /** + getSubjectInfo() : String */
    public function getSubjectInfo(): string
    {
        $pre = $this->pre_requisite ?? 'None';
        return "{$this->subject_code} - {$this->subject_name} ({$this->units} units) | Pre-req: {$pre}";
    }
}
