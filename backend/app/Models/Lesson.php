<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lesson extends Model
{
    protected $fillable = [
        'syllabus_id', 'week_number', 'topic',
        'learning_objectives', 'materials', 'activities', 'assessment',
    ];

    public function syllabus(): BelongsTo
    {
        return $this->belongsTo(Syllabus::class);
    }
}
