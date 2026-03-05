<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAcademicRecord extends Model
{
    protected $fillable = [
        'student_id', 'subject_code', 'subject_name', 'grade', 'units',
        'semester', 'school_year', 'year_level', 'status'
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
