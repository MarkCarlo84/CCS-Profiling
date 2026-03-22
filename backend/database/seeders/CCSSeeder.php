<?php

namespace Database\Seeders;

use App\Models\Faculty;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CCSSeeder extends Seeder
{
    public function run(): void
    {
        // ── 5 Faculty Members (IT and CS Departments) ─────────────────────────
        $faculties = [
            [
                'faculty_id' => 'FAC-2024-001',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'department' => 'Information Technology',
                'position' => 'Associate Professor',
                'email' => 'maria.santos@ccs.edu.ph',
                'contact_number' => '09171234567',
            ],
            [
                'faculty_id' => 'FAC-2024-002',
                'first_name' => 'Roberto',
                'last_name' => 'Cruz',
                'department' => 'Computer Science',
                'position' => 'Assistant Professor',
                'email' => 'roberto.cruz@ccs.edu.ph',
                'contact_number' => '09181234568',
            ],
            [
                'faculty_id' => 'FAC-2024-003',
                'first_name' => 'Angela',
                'last_name' => 'Reyes',
                'department' => 'Information Technology',
                'position' => 'Professor',
                'email' => 'angela.reyes@ccs.edu.ph',
                'contact_number' => '09191234569',
            ],
            [
                'faculty_id' => 'FAC-2024-004',
                'first_name' => 'Carlos',
                'last_name' => 'Mendoza',
                'department' => 'Computer Science',
                'position' => 'Instructor',
                'email' => 'carlos.mendoza@ccs.edu.ph',
                'contact_number' => '09201234570',
            ],
            [
                'faculty_id' => 'FAC-2024-005',
                'first_name' => 'Diana',
                'last_name' => 'Flores',
                'department' => 'Information Technology',
                'position' => 'Assistant Professor',
                'email' => 'diana.flores@ccs.edu.ph',
                'contact_number' => '09211234571',
            ],
        ];

        foreach ($faculties as $facultyData) {
            $faculty = Faculty::firstOrCreate(
                ['faculty_id' => $facultyData['faculty_id']],
                $facultyData
            );

            // Create user account for faculty
            User::firstOrCreate(
                ['email' => $facultyData['email']],
                [
                    'name' => $facultyData['first_name'] . ' ' . $facultyData['last_name'],
                    'password' => Hash::make('faculty123'),
                    'role' => 'teacher',
                    'faculty_id' => $faculty->id,
                ]
            );
        }

        // ── 20 Students with Diverse Information ──────────────────────────────
        $students = [
            // Year 1 - IT Students
            [
                'student_id' => '2024-IT-001',
                'first_name' => 'Juan',
                'middle_name' => 'Garcia',
                'last_name' => 'Dela Cruz',
                'age' => 18,
                'guardian_name' => 'Pedro Dela Cruz',
                'date_of_birth' => '2006-03-15',
                'gender' => 'Male',
                'address' => '123 Rizal Street, Manila',
                'contact_number' => '09171111001',
                'email' => 'juan.delacruz@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2024-IT-002',
                'first_name' => 'Maria',
                'middle_name' => 'Santos',
                'last_name' => 'Reyes',
                'age' => 19,
                'guardian_name' => 'Rosa Reyes',
                'date_of_birth' => '2005-07-22',
                'gender' => 'Female',
                'address' => '456 Bonifacio Avenue, Quezon City',
                'contact_number' => '09181111002',
                'email' => 'maria.reyes@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2024-IT-003',
                'first_name' => 'Carlos',
                'middle_name' => 'Lopez',
                'last_name' => 'Mendoza',
                'age' => 18,
                'guardian_name' => 'Elena Mendoza',
                'date_of_birth' => '2006-11-08',
                'gender' => 'Male',
                'address' => '789 Mabini Street, Makati',
                'contact_number' => '09191111003',
                'email' => 'carlos.mendoza@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2024-IT-004',
                'first_name' => 'Sofia',
                'middle_name' => 'Cruz',
                'last_name' => 'Villanueva',
                'age' => 19,
                'guardian_name' => 'Antonio Villanueva',
                'date_of_birth' => '2005-04-30',
                'gender' => 'Female',
                'address' => '321 Luna Street, Pasig',
                'contact_number' => '09201111004',
                'email' => 'sofia.villanueva@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2024-IT-005',
                'first_name' => 'Miguel',
                'middle_name' => 'Ramos',
                'last_name' => 'Torres',
                'age' => 18,
                'guardian_name' => 'Carmen Torres',
                'date_of_birth' => '2006-09-12',
                'gender' => 'Male',
                'address' => '654 Del Pilar Street, Mandaluyong',
                'contact_number' => '09211111005',
                'email' => 'miguel.torres@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],

            // Year 2 - IT Students
            [
                'student_id' => '2023-IT-001',
                'first_name' => 'Isabella',
                'middle_name' => 'Fernandez',
                'last_name' => 'Garcia',
                'age' => 19,
                'guardian_name' => 'Luis Garcia',
                'date_of_birth' => '2005-01-20',
                'gender' => 'Female',
                'address' => '987 Aguinaldo Highway, Cavite',
                'contact_number' => '09221111006',
                'email' => 'isabella.garcia@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2023-IT-002',
                'first_name' => 'Gabriel',
                'middle_name' => 'Santos',
                'last_name' => 'Bautista',
                'age' => 20,
                'guardian_name' => 'Josefa Bautista',
                'date_of_birth' => '2004-06-18',
                'gender' => 'Male',
                'address' => '147 Roxas Boulevard, Pasay',
                'contact_number' => '09231111007',
                'email' => 'gabriel.bautista@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2023-IT-003',
                'first_name' => 'Valentina',
                'middle_name' => 'Diaz',
                'last_name' => 'Morales',
                'age' => 19,
                'guardian_name' => 'Ricardo Morales',
                'date_of_birth' => '2005-10-05',
                'gender' => 'Female',
                'address' => '258 Taft Avenue, Manila',
                'contact_number' => '09241111008',
                'email' => 'valentina.morales@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2023-IT-004',
                'first_name' => 'Diego',
                'middle_name' => 'Perez',
                'last_name' => 'Castillo',
                'age' => 20,
                'guardian_name' => 'Ana Castillo',
                'date_of_birth' => '2004-12-25',
                'gender' => 'Male',
                'address' => '369 EDSA, Quezon City',
                'contact_number' => '09251111009',
                'email' => 'diego.castillo@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2023-IT-005',
                'first_name' => 'Camila',
                'middle_name' => 'Gomez',
                'last_name' => 'Rivera',
                'age' => 19,
                'guardian_name' => 'Fernando Rivera',
                'date_of_birth' => '2005-08-14',
                'gender' => 'Female',
                'address' => '741 Ortigas Avenue, Pasig',
                'contact_number' => '09261111010',
                'email' => 'camila.rivera@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],

            // Year 1 - CS Students
            [
                'student_id' => '2024-CS-001',
                'first_name' => 'Lucas',
                'middle_name' => 'Martinez',
                'last_name' => 'Hernandez',
                'age' => 18,
                'guardian_name' => 'Gloria Hernandez',
                'date_of_birth' => '2006-02-28',
                'gender' => 'Male',
                'address' => '852 Quezon Avenue, Quezon City',
                'contact_number' => '09271111011',
                'email' => 'lucas.hernandez@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2024-CS-002',
                'first_name' => 'Emma',
                'middle_name' => 'Rodriguez',
                'last_name' => 'Lopez',
                'age' => 19,
                'guardian_name' => 'Manuel Lopez',
                'date_of_birth' => '2005-05-17',
                'gender' => 'Female',
                'address' => '963 Commonwealth Avenue, Quezon City',
                'contact_number' => '09281111012',
                'email' => 'emma.lopez@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2024-CS-003',
                'first_name' => 'Mateo',
                'middle_name' => 'Gonzalez',
                'last_name' => 'Ramirez',
                'age' => 18,
                'guardian_name' => 'Patricia Ramirez',
                'date_of_birth' => '2006-07-09',
                'gender' => 'Male',
                'address' => '159 España Boulevard, Manila',
                'contact_number' => '09291111013',
                'email' => 'mateo.ramirez@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2024-CS-004',
                'first_name' => 'Olivia',
                'middle_name' => 'Sanchez',
                'last_name' => 'Torres',
                'age' => 19,
                'guardian_name' => 'Roberto Torres',
                'date_of_birth' => '2005-11-23',
                'gender' => 'Female',
                'address' => '357 Katipunan Avenue, Quezon City',
                'contact_number' => '09301111014',
                'email' => 'olivia.torres@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2024-CS-005',
                'first_name' => 'Sebastian',
                'middle_name' => 'Flores',
                'last_name' => 'Navarro',
                'age' => 18,
                'guardian_name' => 'Lucia Navarro',
                'date_of_birth' => '2006-04-06',
                'gender' => 'Male',
                'address' => '753 Aurora Boulevard, Quezon City',
                'contact_number' => '09311111015',
                'email' => 'sebastian.navarro@student.ccs.edu.ph',
                'enrollment_date' => '2024-08-01',
                'status' => 'active',
            ],

            // Year 2 - CS Students
            [
                'student_id' => '2023-CS-001',
                'first_name' => 'Mia',
                'middle_name' => 'Jimenez',
                'last_name' => 'Ruiz',
                'age' => 19,
                'guardian_name' => 'Eduardo Ruiz',
                'date_of_birth' => '2005-09-30',
                'gender' => 'Female',
                'address' => '951 Marcos Highway, Marikina',
                'contact_number' => '09321111016',
                'email' => 'mia.ruiz@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2023-CS-002',
                'first_name' => 'Alexander',
                'middle_name' => 'Moreno',
                'last_name' => 'Gutierrez',
                'age' => 20,
                'guardian_name' => 'Teresa Gutierrez',
                'date_of_birth' => '2004-03-11',
                'gender' => 'Male',
                'address' => '486 Gil Puyat Avenue, Makati',
                'contact_number' => '09331111017',
                'email' => 'alexander.gutierrez@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2023-CS-003',
                'first_name' => 'Charlotte',
                'middle_name' => 'Alvarez',
                'last_name' => 'Ortiz',
                'age' => 19,
                'guardian_name' => 'Miguel Ortiz',
                'date_of_birth' => '2005-12-19',
                'gender' => 'Female',
                'address' => '624 Ayala Avenue, Makati',
                'contact_number' => '09341111018',
                'email' => 'charlotte.ortiz@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2023-CS-004',
                'first_name' => 'Daniel',
                'middle_name' => 'Castro',
                'last_name' => 'Vargas',
                'age' => 20,
                'guardian_name' => 'Sofia Vargas',
                'date_of_birth' => '2004-08-07',
                'gender' => 'Male',
                'address' => '135 Paseo de Roxas, Makati',
                'contact_number' => '09351111019',
                'email' => 'daniel.vargas@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],
            [
                'student_id' => '2023-CS-005',
                'first_name' => 'Amelia',
                'middle_name' => 'Romero',
                'last_name' => 'Medina',
                'age' => 19,
                'guardian_name' => 'Jorge Medina',
                'date_of_birth' => '2005-02-14',
                'gender' => 'Female',
                'address' => '246 Buendia Avenue, Makati',
                'contact_number' => '09361111020',
                'email' => 'amelia.medina@student.ccs.edu.ph',
                'enrollment_date' => '2023-08-01',
                'status' => 'active',
            ],
        ];

        foreach ($students as $studentData) {
            $student = Student::firstOrCreate(
                ['student_id' => $studentData['student_id']],
                $studentData
            );

            // Create user account for student
            User::firstOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['first_name'] . ' ' . $studentData['last_name'],
                    'password' => Hash::make('student123'),
                    'role' => 'student',
                    'student_id' => $student->id,
                ]
            );
        }

        $this->command->info('✓ Created 5 faculty members (IT and CS departments)');
        $this->command->info('✓ Created 20 students (10 IT, 10 CS)');
        $this->command->info('');
        $this->command->info('Faculty Login:');
        $this->command->info('  Email: [faculty_email]@ccs.edu.ph');
        $this->command->info('  Password: faculty123');
        $this->command->info('');
        $this->command->info('Student Login:');
        $this->command->info('  Email: [student_email]@student.ccs.edu.ph');
        $this->command->info('  Password: student123');
    }
}
