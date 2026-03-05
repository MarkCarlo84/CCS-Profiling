<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentViolation extends Model
{
    protected $fillable = ['student_id', 'violation', 'severity', 'date_committed', 'school_year', 'description', 'sanction', 'status'];

    protected $casts = ['date_committed' => 'date'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
