<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class EventParticipant extends Model
{
    protected $fillable = [
        'event_id', 'participable_type', 'participable_id',
        'role', 'award', 'remarks',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function participable(): MorphTo
    {
        return $this->morphTo();
    }
}
