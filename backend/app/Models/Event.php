<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'title', 'type', 'category', 'organizer', 'venue',
        'date_start', 'date_end', 'description', 'status', 'department_id', 'max_participants',
    ];

    protected $casts = [
        'date_start' => 'date',
        'date_end'   => 'date',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(EventParticipant::class);
    }
}
