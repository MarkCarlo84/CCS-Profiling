<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Violation extends Model
{
    protected $fillable = [
        'student_id', 'violation_type', 'description',
        'date_committed', 'severity_level', 'action_taken',
    ];

    protected $casts = [
        'date_committed' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** + getViolationDetails() : String */
    public function getViolationDetails(): string
    {
        $date = $this->date_committed ? $this->date_committed->format('Y-m-d') : 'N/A';
        return "{$this->violation_type} ({$this->severity_level}) on {$date} | Action: {$this->action_taken}";
    }

    /** + updateAction(action: String) : void */
    public function updateAction(string $action): void
    {
        $this->update(['action_taken' => $action]);
    }
}
