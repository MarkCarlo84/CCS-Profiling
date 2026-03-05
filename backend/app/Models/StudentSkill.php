<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSkill extends Model
{
    protected $fillable = ['student_id', 'skill', 'category', 'proficiency', 'description'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
