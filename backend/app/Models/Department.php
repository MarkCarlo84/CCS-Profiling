<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = ['name', 'code', 'description'];

    public function faculties(): HasMany
    {
        return $this->hasMany(Faculty::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }
}
