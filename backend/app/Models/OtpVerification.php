<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    protected $fillable = ['email', 'otp', 'action', 'used', 'expires_at'];

    protected $casts = [
        'expires_at' => 'datetime',
        'used'       => 'boolean',
    ];

    public function isValid(string $otp): bool
    {
        return !$this->used
            && $this->otp === $otp
            && $this->expires_at->isFuture();
    }
}
