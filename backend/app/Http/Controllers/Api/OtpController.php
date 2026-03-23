<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\OtpVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OtpController extends Controller
{
    /**
     * POST /api/otp/send
     * Generates and sends an OTP to the faculty/student's email.
     *
     * Body: { "action": "add_faculty" | "add_student", "email": "target@email.com" }
     */
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'action' => 'required|in:add_faculty,add_student',
            'email'  => 'required|email',
        ]);

        $targetEmail = $request->email;
        $otp         = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Invalidate any previous unused OTPs for this email + action
        OtpVerification::where('email', $targetEmail)
            ->where('action', $request->action)
            ->where('used', false)
            ->delete();

        OtpVerification::create([
            'email'      => $targetEmail,
            'otp'        => $otp,
            'action'     => $request->action,
            'used'       => false,
            'expires_at' => now()->addMinutes(10),
        ]);

        try {
            Mail::to($targetEmail)->send(new OtpMail($otp, $request->action));
        } catch (\Exception $e) {
            \Log::error('OTP email failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send OTP email. Please try again.'], 500);
        }

        return response()->json(['message' => 'OTP sent to ' . $targetEmail]);
    }

    /**
     * POST /api/otp/verify
     * Verifies the OTP without consuming it — used before the actual store call.
     *
     * Body: { "otp": "123456", "action": "add_faculty" | "add_student", "email": "target@email.com" }
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'otp'    => 'required|string|size:6',
            'action' => 'required|in:add_faculty,add_student',
            'email'  => 'required|email',
        ]);

        $record = OtpVerification::where('email', $request->email)
            ->where('action', $request->action)
            ->where('used', false)
            ->latest()
            ->first();

        if (!$record || !$record->isValid($request->otp)) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 422);
        }

        return response()->json(['message' => 'OTP verified.', 'valid' => true]);
    }
}
