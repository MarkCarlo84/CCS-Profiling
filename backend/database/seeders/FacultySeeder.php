<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Faculty;
use Illuminate\Database\Seeder;

class FacultySeeder extends Seeder
{
    public function run(): void
    {
        $ccs = Department::where('code', 'CCS')->first()->id;
        $ce  = Department::where('code', 'CE')->first()->id;
        $cba = Department::where('code', 'CBA')->first()->id;

        $faculties = [
            // CCS
            ['department_id' => $ccs, 'employee_number' => 'EMP-001', 'first_name' => 'Maria', 'last_name' => 'Santos', 'middle_name' => 'Reyes', 'position' => 'Instructor I', 'employment_type' => 'full_time', 'specialization' => 'Web Development', 'highest_education' => 'MS Information Technology', 'email' => 'msantos@ccs.edu.ph', 'phone' => '09171234001', 'date_hired' => '2018-06-01', 'status' => 'active'],
            ['department_id' => $ccs, 'employee_number' => 'EMP-002', 'first_name' => 'Jose', 'last_name' => 'Dela Cruz', 'middle_name' => 'Padilla', 'position' => 'Instructor II', 'employment_type' => 'full_time', 'specialization' => 'Data Structures & Algorithms', 'highest_education' => 'BS Computer Science', 'email' => 'jdelacruz@ccs.edu.ph', 'phone' => '09171234002', 'date_hired' => '2019-06-01', 'status' => 'active'],
            ['department_id' => $ccs, 'employee_number' => 'EMP-003', 'first_name' => 'Ana', 'last_name' => 'Reyes', 'middle_name' => 'Cruz', 'position' => 'Professor I', 'employment_type' => 'full_time', 'specialization' => 'Database Management', 'highest_education' => 'PhD Computer Science', 'email' => 'areyes@ccs.edu.ph', 'phone' => '09171234003', 'date_hired' => '2015-06-01', 'status' => 'active'],
            ['department_id' => $ccs, 'employee_number' => 'EMP-004', 'first_name' => 'Ricardo', 'last_name' => 'Bautista', 'middle_name' => null, 'position' => 'Instructor I', 'employment_type' => 'part_time', 'specialization' => 'Mobile Development', 'highest_education' => 'MS Computer Science', 'email' => 'rbautista@ccs.edu.ph', 'phone' => '09171234004', 'date_hired' => '2022-08-01', 'status' => 'active'],
            ['department_id' => $ccs, 'employee_number' => 'EMP-005', 'first_name' => 'Luz', 'last_name' => 'Gonzales', 'middle_name' => 'Mateo', 'position' => 'Department Head', 'employment_type' => 'full_time', 'specialization' => 'Artificial Intelligence', 'highest_education' => 'PhD Information Technology', 'email' => 'lgonzales@ccs.edu.ph', 'phone' => '09171234005', 'date_hired' => '2010-06-01', 'status' => 'active'],
            // CE
            ['department_id' => $ce, 'employee_number' => 'EMP-006', 'first_name' => 'Ramon', 'last_name' => 'Villanueva', 'middle_name' => 'Torres', 'position' => 'Professor II', 'employment_type' => 'full_time', 'specialization' => 'Structural Engineering', 'highest_education' => 'PhD Civil Engineering', 'email' => 'rvillanueva@ce.edu.ph', 'phone' => '09171234006', 'date_hired' => '2012-06-01', 'status' => 'active'],
            ['department_id' => $ce, 'employee_number' => 'EMP-007', 'first_name' => 'Elena', 'last_name' => 'Mendoza', 'middle_name' => null, 'position' => 'Instructor I', 'employment_type' => 'full_time', 'specialization' => 'Electronics', 'highest_education' => 'MS Electronics Engineering', 'email' => 'emendoza@ce.edu.ph', 'phone' => '09171234007', 'date_hired' => '2020-08-01', 'status' => 'active'],
            // CBA
            ['department_id' => $cba, 'employee_number' => 'EMP-008', 'first_name' => 'Patricia', 'last_name' => 'Aquino', 'middle_name' => 'Lim', 'position' => 'Professor I', 'employment_type' => 'full_time', 'specialization' => 'Financial Accounting', 'highest_education' => 'CPA, MBA', 'email' => 'paquino@cba.edu.ph', 'phone' => '09171234008', 'date_hired' => '2016-06-01', 'status' => 'active'],
            ['department_id' => $cba, 'employee_number' => 'EMP-009', 'first_name' => 'Carlos', 'last_name' => 'Navarro', 'middle_name' => 'Soriano', 'position' => 'Instructor II', 'employment_type' => 'contractual', 'specialization' => 'Marketing Management', 'highest_education' => 'MBA', 'email' => 'cnavarro@cba.edu.ph', 'phone' => '09171234009', 'date_hired' => '2023-01-01', 'status' => 'active'],
            ['department_id' => $ccs, 'employee_number' => 'EMP-010', 'first_name' => 'Maricel', 'last_name' => 'Flores', 'middle_name' => 'Tan', 'position' => 'Instructor III', 'employment_type' => 'full_time', 'specialization' => 'Cybersecurity', 'highest_education' => 'MS Information Security', 'email' => 'mflores@ccs.edu.ph', 'phone' => '09171234010', 'date_hired' => '2017-06-01', 'status' => 'on_leave'],
        ];

        foreach ($faculties as $faculty) {
            Faculty::firstOrCreate(['employee_number' => $faculty['employee_number']], $faculty);
        }
    }
}
