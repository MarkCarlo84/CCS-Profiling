<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .card { background: #fff; border-radius: 8px; padding: 32px; max-width: 480px; margin: auto; }
        .otp { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; text-align: center; margin: 24px 0; }
        .note { color: #6b7280; font-size: 13px; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <h2 style="text-align:center; color:#111827;">
            @if($action === 'add_faculty') Add Faculty Confirmation
            @elseif($action === 'add_student') Add Student Confirmation
            @else Email Verification
            @endif
        </h2>
        <p style="color:#374151; text-align:center;">
            @if($action === 'first_login')
                Welcome! Use the OTP below to verify your email and complete your first login.
            @else
                Use the OTP below to confirm the action.
            @endif
            It expires in <strong>10 minutes</strong>.
        </p>
        <div class="otp">{{ $otp }}</div>
        <p class="note">If you did not request this, please ignore this email.</p>
    </div>
</body>
</html>
