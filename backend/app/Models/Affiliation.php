<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Affiliation extends Model
{
    protected $fillable = [
        'student_id', 'name', 'type', 'role', 'date_joined',
    ];

    protected $casts = [
        'date_joined' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** + getAffiliationDetails() : String */
    public function getAffiliationDetails(): string
    {
        $joined = $this->date_joined ? $this->date_joined->format('Y-m-d') : 'N/A';
        return "{$this->name} ({$this->type}) | Role: {$this->role} | Joined: {$joined}";
    }
}
