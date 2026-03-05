<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'building', 'room_number', 'name', 'type',
        'capacity', 'is_available', 'remarks',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name ?? "{$this->building} {$this->room_number}";
    }
}
