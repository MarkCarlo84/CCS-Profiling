<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Reserve admin account
        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@ccs.edu.ph')],
            [
                'name'     => 'CCS Admin',
                'password' => Hash::make('admin1234'),
                'role'     => 'admin',
            ]
        );

        $this->command->info('✓ Admin user ready');
        $this->command->info('  Email: admin@ccs.edu.ph');
        $this->command->info('  Password: admin1234');

        $this->call(SubjectSeeder::class);
    }
}
