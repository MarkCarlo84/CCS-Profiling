<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// ← Change this to your real email
$newEmail = 'endozonerisaraven90@gmail.com';

$admin = \App\Models\User::where('role', 'admin')->first();
$admin->update(['email' => $newEmail]);

echo "Admin email updated to: {$admin->fresh()->email}\n";
