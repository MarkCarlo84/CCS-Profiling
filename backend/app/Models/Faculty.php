<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Faculty extends Model
{
    protected $fillable = [
        'department_id', 'employee_number', 'first_name', 'last_name', 'middle_name',
        'position', 'employment_type', 'specialization', 'highest_education',
        'email', 'phone', 'date_hired', 'status', 'remarks'
    ];

    protected $casts = [
        'date_hired' => 'date',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function getFullNameAttribute(): string
    {
        $middle = $this->middle_name ? " {$this->middle_name[0]}." : '';
        return "{$this->first_name}{$middle} {$this->last_name}";
    }
}
