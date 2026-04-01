<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    protected $fillable = ['school_year', 'semester', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    /**
     * Get the currently active period, or null if none set.
     */
    public static function active(): ?self
    {
        return static::where('is_active', true)->first();
    }

    /**
     * Given the current period, compute what the next one would be.
     * 1st → 2nd (same school year)
     * 2nd → 1st (next school year)
     */
    public function nextPeriod(): array
    {
        if ($this->semester === '1st') {
            return ['school_year' => $this->school_year, 'semester' => '2nd'];
        }

        // 2nd → advance school year
        [$start, $end] = explode('-', $this->school_year);
        $newYear = ($start + 1) . '-' . ($end + 1);
        return ['school_year' => $newYear, 'semester' => '1st'];
    }
}
