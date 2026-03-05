<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentNonAcademicRecord extends Model
{
    protected $fillable = [
        'student_id', 'activity', 'category', 'award', 'level',
        'date_held', 'school_year', 'description'
    ];

    protected $casts = ['date_held' => 'date'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
