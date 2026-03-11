<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Skill extends Model
{
    protected $fillable = [
        'student_id', 'skill_name', 'skill_level', 'certification',
    ];

    protected $casts = [
        'certification' => 'boolean',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** + getSkillLevel() : String */
    public function getSkillLevel(): string
    {
        return $this->skill_level ?? 'beginner';
    }

    /** + updateSkillLevel(level: String) : void */
    public function updateSkillLevel(string $level): void
    {
        $this->update(['skill_level' => $level]);
    }
}
