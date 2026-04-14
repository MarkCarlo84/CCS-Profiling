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
                'password' => Hash::make('Admin1234'),
                'role'     => 'admin',
            ]
        );

        $this->command->info('✓ Admin user ready');
        $this->command->info('  Email: admin@ccs.edu.ph');
        $this->command->info('  Password: Admin1234');

        $this->call(SubjectSeeder::class);
        $this->call(StudentBulkSeeder::class);
        $this->call(DemoSeeder::class);
    }
}
