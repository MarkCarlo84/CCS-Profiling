<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@ccs.edu.ph')],
            [
                'name'     => 'CCS Admin',
                'password' => Hash::make('admin1234'),
                'role'     => 'admin',
            ]
        );

        $this->command->info('✓ Admin user created');
        $this->command->info('  Email: admin@ccs.edu.ph');
        $this->command->info('  Password: admin1234');
        $this->command->info('');

        // Seed faculty and students
        $this->call([
            CCSSeeder::class,
        ]);
    }
}
