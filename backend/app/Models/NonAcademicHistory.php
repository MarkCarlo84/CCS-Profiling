<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NonAcademicHistory extends Model
{
    protected $fillable = [
        'student_id', 'activity_title', 'category', 'description',
        'date_started', 'date_ended', 'role', 'organizer', 'game_result',
    ];

    protected $casts = [
        'date_started' => 'date',
        'date_ended'   => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** + getActivityDetails() : String */
    public function getActivityDetails(): string
    {
        $start = $this->date_started ? $this->date_started->format('Y-m-d') : 'N/A';
        $end   = $this->date_ended   ? $this->date_ended->format('Y-m-d')   : 'present';
        $result = $this->game_result ? " | Result: {$this->game_result}" : '';
        return "{$this->activity_title} ({$this->category}) | {$start} to {$end} | Role: {$this->role}{$result}";
    }

    /** + updateActivity(description: String) : void */
    public function updateActivity(string $description): void
    {
        $this->update(['description' => $description]);
    }
}
