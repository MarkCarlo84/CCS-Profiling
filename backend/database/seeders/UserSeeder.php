<?php

namespace Database\Seeders;

use App\Models\Faculty;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ─────────────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@ccs.edu.ph')],
            [
                'name'     => 'CCS Admin',
                'password' => Hash::make('admin1234'),
                'role'     => 'admin',
            ]
        );

        // ── Teachers (linked to first 5 faculty records) ──────────────────────
        $teacherAccounts = [
            ['faculty_id' => 'FAC-001', 'email' => 'msantos@ccs.edu.ph',    'password' => 'teacher1234'],
            ['faculty_id' => 'FAC-002', 'email' => 'jdelacruz@ccs.edu.ph',  'password' => 'teacher1234'],
            ['faculty_id' => 'FAC-003', 'email' => 'areyes@ccs.edu.ph',     'password' => 'teacher1234'],
            ['faculty_id' => 'FAC-004', 'email' => 'rbautista@ccs.edu.ph',  'password' => 'teacher1234'],
            ['faculty_id' => 'FAC-005', 'email' => 'lgonzales@ccs.edu.ph',  'password' => 'teacher1234'],
        ];

        foreach ($teacherAccounts as $account) {
            $faculty = Faculty::where('faculty_id', $account['faculty_id'])->first();
            if (!$faculty) continue;

            User::firstOrCreate(
                ['email' => $account['email']],
                [
                    'name'       => $faculty->full_name,
                    'password'   => Hash::make($account['password']),
                    'role'       => 'teacher',
                    'faculty_id' => $faculty->id,
                ]
            );
        }

        // ── Students (linked to first 5 student records) ──────────────────────
        $studentAccounts = [
            ['student_id' => '2021-CCS-001', 'email' => 'juan.delacruz@student.edu.ph', 'password' => 'student1234'],
            ['student_id' => '2021-CCS-002', 'email' => 'anna.santos@student.edu.ph',   'password' => 'student1234'],
            ['student_id' => '2022-CCS-001', 'email' => 'mark.v@student.edu.ph',        'password' => 'student1234'],
            ['student_id' => '2022-CCS-002', 'email' => 'claire.m@student.edu.ph',      'password' => 'student1234'],
            ['student_id' => '2023-CCS-001', 'email' => 'leo.t@student.edu.ph',         'password' => 'student1234'],
        ];

        foreach ($studentAccounts as $account) {
            $student = Student::where('student_id', $account['student_id'])->first();
            if (!$student) continue;

            User::firstOrCreate(
                ['email' => $account['email']],
                [
                    'name'       => $student->full_name,
                    'password'   => Hash::make($account['password']),
                    'role'       => 'student',
                    'student_id' => $student->id,
                ]
            );
        }
    }
}

