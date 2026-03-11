<?php

namespace Database\Seeders;

use App\Models\Faculty;
use Illuminate\Database\Seeder;

class FacultySeeder extends Seeder
{
    public function run(): void
    {
        $faculties = [
            ['faculty_id'=>'FAC-001','first_name'=>'Maria','last_name'=>'Santos','middle_name'=>'Reyes','department'=>'CCS','position'=>'Instructor I','email'=>'msantos@ccs.edu.ph','contact_number'=>'09171234001'],
            ['faculty_id'=>'FAC-002','first_name'=>'Jose','last_name'=>'Dela Cruz','middle_name'=>'Padilla','department'=>'CCS','position'=>'Instructor II','email'=>'jdelacruz@ccs.edu.ph','contact_number'=>'09171234002'],
            ['faculty_id'=>'FAC-003','first_name'=>'Ana','last_name'=>'Reyes','middle_name'=>'Cruz','department'=>'CCS','position'=>'Professor I','email'=>'areyes@ccs.edu.ph','contact_number'=>'09171234003'],
            ['faculty_id'=>'FAC-004','first_name'=>'Ricardo','last_name'=>'Bautista','middle_name'=>null,'department'=>'CCS','position'=>'Instructor I','email'=>'rbautista@ccs.edu.ph','contact_number'=>'09171234004'],
            ['faculty_id'=>'FAC-005','first_name'=>'Luz','last_name'=>'Gonzales','middle_name'=>'Mateo','department'=>'CCS','position'=>'Department Head','email'=>'lgonzales@ccs.edu.ph','contact_number'=>'09171234005'],
            ['faculty_id'=>'FAC-006','first_name'=>'Ramon','last_name'=>'Villanueva','middle_name'=>'Torres','department'=>'CE','position'=>'Professor II','email'=>'rvillanueva@ce.edu.ph','contact_number'=>'09171234006'],
            ['faculty_id'=>'FAC-007','first_name'=>'Elena','last_name'=>'Mendoza','middle_name'=>null,'department'=>'CE','position'=>'Instructor I','email'=>'emendoza@ce.edu.ph','contact_number'=>'09171234007'],
            ['faculty_id'=>'FAC-008','first_name'=>'Patricia','last_name'=>'Aquino','middle_name'=>'Lim','department'=>'CBA','position'=>'Professor I','email'=>'paquino@cba.edu.ph','contact_number'=>'09171234008'],
            ['faculty_id'=>'FAC-009','first_name'=>'Carlos','last_name'=>'Navarro','middle_name'=>'Soriano','department'=>'CBA','position'=>'Instructor II','email'=>'cnavarro@cba.edu.ph','contact_number'=>'09171234009'],
            ['faculty_id'=>'FAC-010','first_name'=>'Maricel','last_name'=>'Flores','middle_name'=>'Tan','department'=>'CCS','position'=>'Instructor III','email'=>'mflores@ccs.edu.ph','contact_number'=>'09171234010'],
        ];

        foreach ($faculties as $faculty) {
            Faculty::firstOrCreate(['faculty_id' => $faculty['faculty_id']], $faculty);
        }
    }
}
