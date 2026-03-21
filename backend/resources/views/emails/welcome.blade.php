<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .card { background: #fff; border-radius: 8px; padding: 32px; max-width: 480px; margin: auto; }
        .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 16px; }
        .value { font-size: 16px; font-weight: bold; color: #111827; margin-top: 4px; }
        .badge { display: inline-block; background: #4f46e5; color: #fff; border-radius: 4px; padding: 2px 10px; font-size: 13px; text-transform: capitalize; }
        .note { color: #6b7280; font-size: 13px; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="card">
        <h2 style="color:#111827; margin-bottom:4px;">Welcome, {{ $name }}!</h2>
        <p style="color:#374151;">Your account has been created. Here are your login credentials:</p>

        <div class="label">Role</div>
        <div class="value"><span class="badge">{{ $role }}</span></div>

        <div class="label">Email</div>
        <div class="value">{{ $email }}</div>

        <div class="label">Default Password</div>
        <div class="value">{{ $password }}</div>

        <p class="note">Please log in and change your password as soon as possible.</p>
    </div>
</body>
</html>
