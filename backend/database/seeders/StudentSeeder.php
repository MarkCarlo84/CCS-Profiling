<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Student;
use App\Models\StudentAffiliation;
use App\Models\StudentViolation;
use App\Models\StudentAcademicRecord;
use App\Models\StudentNonAcademicRecord;
use App\Models\StudentSkill;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $ccs = Department::where('code', 'CCS')->first()->id;
        $ce  = Department::where('code', 'CE')->first()->id;
        $cba = Department::where('code', 'CBA')->first()->id;

        $studentsData = [
            // CCS Students
            ['department_id'=>$ccs,'student_number'=>'2021-CCS-001','first_name'=>'Juan','last_name'=>'Dela Cruz','middle_name'=>'Reyes','year_level'=>'3rd Year','section'=>'A','email'=>'juan.delacruz@student.edu.ph','phone'=>'09181000001','gender'=>'Male','gpa'=>1.25,'status'=>'active'],
            ['department_id'=>$ccs,'student_number'=>'2021-CCS-002','first_name'=>'Anna','last_name'=>'Santos','middle_name'=>'Lim','year_level'=>'3rd Year','section'=>'A','email'=>'anna.santos@student.edu.ph','phone'=>'09181000002','gender'=>'Female','gpa'=>1.50,'status'=>'active'],
            ['department_id'=>$ccs,'student_number'=>'2022-CCS-001','first_name'=>'Mark','last_name'=>'Villanueva','middle_name'=>null,'year_level'=>'2nd Year','section'=>'B','email'=>'mark.v@student.edu.ph','phone'=>'09181000003','gender'=>'Male','gpa'=>1.75,'status'=>'active'],
            ['department_id'=>$ccs,'student_number'=>'2022-CCS-002','first_name'=>'Claire','last_name'=>'Mendez','middle_name'=>'Aquino','year_level'=>'2nd Year','section'=>'B','email'=>'claire.m@student.edu.ph','phone'=>'09181000004','gender'=>'Female','gpa'=>1.00,'status'=>'active'],
            ['department_id'=>$ccs,'student_number'=>'2023-CCS-001','first_name'=>'Leo','last_name'=>'Torres','middle_name'=>null,'year_level'=>'1st Year','section'=>'C','email'=>'leo.t@student.edu.ph','phone'=>'09181000005','gender'=>'Male','gpa'=>2.00,'status'=>'active'],
            ['department_id'=>$ccs,'student_number'=>'2020-CCS-001','first_name'=>'Grace','last_name'=>'Navarro','middle_name'=>'Cruz','year_level'=>'4th Year','section'=>'A','email'=>'grace.n@student.edu.ph','phone'=>'09181000006','gender'=>'Female','gpa'=>1.25,'status'=>'active'],
            // CE Students
            ['department_id'=>$ce,'student_number'=>'2021-CE-001','first_name'=>'Kevin','last_name'=>'Bautista','middle_name'=>null,'year_level'=>'3rd Year','section'=>'A','email'=>'kevin.b@student.edu.ph','phone'=>'09181000007','gender'=>'Male','gpa'=>1.50,'status'=>'active'],
            ['department_id'=>$ce,'student_number'=>'2022-CE-001','first_name'=>'Diana','last_name'=>'Garcia','middle_name'=>'Reyes','year_level'=>'2nd Year','section'=>'A','email'=>'diana.g@student.edu.ph','phone'=>'09181000008','gender'=>'Female','gpa'=>1.75,'status'=>'active'],
            // CBA Students
            ['department_id'=>$cba,'student_number'=>'2021-CBA-001','first_name'=>'Patrick','last_name'=>'Lopez','middle_name'=>'Santos','year_level'=>'3rd Year','section'=>'A','email'=>'patrick.l@student.edu.ph','phone'=>'09181000009','gender'=>'Male','gpa'=>2.25,'status'=>'active'],
            ['department_id'=>$cba,'student_number'=>'2022-CBA-001','first_name'=>'Sofia','last_name'=>'Flores','middle_name'=>null,'year_level'=>'2nd Year','section'=>'B','email'=>'sofia.f@student.edu.ph','phone'=>'09181000010','gender'=>'Female','gpa'=>1.50,'status'=>'active'],
        ];

        foreach ($studentsData as $sData) {
            $student = Student::firstOrCreate(['student_number' => $sData['student_number']], $sData);

            // Affiliations
            $this->seedAffiliations($student);

            // Violations
            $this->seedViolations($student);

            // Academic Records
            $this->seedAcademicRecords($student);

            // Non-Academic Records
            $this->seedNonAcademicRecords($student);

            // Skills
            $this->seedSkills($student);
        }
    }

    private function seedAffiliations(Student $student): void
    {
        $maps = [
            '2021-CCS-001' => [['organization'=>'Junior Philippine Computer Society','role'=>'President','school_year'=>'2023-2024','is_active'=>true],['organization'=>'Google Developer Student Club','role'=>'Member','school_year'=>'2022-2023','is_active'=>false]],
            '2022-CCS-002' => [['organization'=>'Junior Philippine Computer Society','role'=>'Vice President','school_year'=>'2023-2024','is_active'=>true]],
            '2020-CCS-001' => [['organization'=>'Junior Philippine Computer Society','role'=>'Secretary','school_year'=>'2023-2024','is_active'=>true],['organization'=>'University Supreme Council','role'=>'Senator','school_year'=>'2023-2024','is_active'=>true]],
            '2021-CE-001'  => [['organization'=>'Institute of Civil Engineers Philippines','role'=>'Member','school_year'=>'2023-2024','is_active'=>true]],
            '2021-CBA-001' => [['organization'=>'Junior Marketing Association','role'=>'Treasurer','school_year'=>'2023-2024','is_active'=>true]],
        ];

        if (isset($maps[$student->student_number])) {
            foreach ($maps[$student->student_number] as $aff) {
                StudentAffiliation::firstOrCreate(
                    ['student_id' => $student->id, 'organization' => $aff['organization'], 'school_year' => $aff['school_year']],
                    $aff + ['student_id' => $student->id]
                );
            }
        }
    }

    private function seedViolations(Student $student): void
    {
        $maps = [
            '2021-CCS-002' => [['violation'=>'Tardiness','severity'=>'minor','date_committed'=>'2023-09-10','school_year'=>'2023-2024','sanction'=>'Warning letter','status'=>'resolved']],
            '2022-CCS-001' => [['violation'=>'Academic Dishonesty','severity'=>'major','date_committed'=>'2023-11-15','school_year'=>'2023-2024','sanction'=>'Grade of 5.0 in subject','status'=>'resolved']],
            '2021-CBA-001' => [['violation'=>'Dress Code Violation','severity'=>'minor','date_committed'=>'2024-01-20','school_year'=>'2023-2024','sanction'=>'Community service','status'=>'resolved']],
        ];

        if (isset($maps[$student->student_number])) {
            foreach ($maps[$student->student_number] as $vio) {
                StudentViolation::firstOrCreate(
                    ['student_id' => $student->id, 'violation' => $vio['violation'], 'date_committed' => $vio['date_committed']],
                    $vio + ['student_id' => $student->id]
                );
            }
        }
    }

    private function seedAcademicRecords(Student $student): void
    {
        if ($student->department->code === 'CCS') {
            $records = [
                ['subject_code'=>'CC101','subject_name'=>'Introduction to Computing','grade'=>1.25,'units'=>3,'semester'=>'1st Semester','school_year'=>'2021-2022','year_level'=>'1st Year','status'=>'passed'],
                ['subject_code'=>'CC102','subject_name'=>'Computer Programming 1','grade'=>1.50,'units'=>3,'semester'=>'1st Semester','school_year'=>'2021-2022','year_level'=>'1st Year','status'=>'passed'],
                ['subject_code'=>'CC201','subject_name'=>'Data Structures & Algorithms','grade'=>1.75,'units'=>3,'semester'=>'1st Semester','school_year'=>'2022-2023','year_level'=>'2nd Year','status'=>'passed'],
                ['subject_code'=>'CC202','subject_name'=>'Object-Oriented Programming','grade'=>1.25,'units'=>3,'semester'=>'2nd Semester','school_year'=>'2022-2023','year_level'=>'2nd Year','status'=>'passed'],
            ];
        } elseif ($student->department->code === 'CE') {
            $records = [
                ['subject_code'=>'EN101','subject_name'=>'Engineering Drawing','grade'=>1.50,'units'=>3,'semester'=>'1st Semester','school_year'=>'2021-2022','year_level'=>'1st Year','status'=>'passed'],
                ['subject_code'=>'EN102','subject_name'=>'Engineering Mathematics','grade'=>1.75,'units'=>3,'semester'=>'2nd Semester','school_year'=>'2021-2022','year_level'=>'1st Year','status'=>'passed'],
            ];
        } else {
            $records = [
                ['subject_code'=>'BA101','subject_name'=>'Principles of Management','grade'=>2.00,'units'=>3,'semester'=>'1st Semester','school_year'=>'2021-2022','year_level'=>'1st Year','status'=>'passed'],
                ['subject_code'=>'BA102','subject_name'=>'Business Mathematics','grade'=>2.25,'units'=>3,'semester'=>'2nd Semester','school_year'=>'2021-2022','year_level'=>'1st Year','status'=>'passed'],
            ];
        }

        foreach ($records as $rec) {
            StudentAcademicRecord::firstOrCreate(
                ['student_id'=>$student->id,'subject_code'=>$rec['subject_code'],'school_year'=>$rec['school_year']],
                $rec + ['student_id'=>$student->id]
            );
        }
    }

    private function seedNonAcademicRecords(Student $student): void
    {
        $maps = [
            '2021-CCS-001' => [['activity'=>'Regional Programming Contest','category'=>'Academic','award'=>'Champion','level'=>'regional','date_held'=>'2023-11-20','school_year'=>'2023-2024']],
            '2020-CCS-001' => [['activity'=>'National Coding Olympiad','category'=>'Academic','award'=>'2nd Place','level'=>'national','date_held'=>'2023-12-10','school_year'=>'2023-2024']],
            '2021-CE-001'  => [['activity'=>'Basketball Intramurals','category'=>'Sports','award'=>'Champion (Best Player)','level'=>'school','date_held'=>'2024-01-15','school_year'=>'2023-2024']],
            '2022-CE-001'  => [['activity'=>'Basketball Intramurals','category'=>'Sports','award'=>'Runner-Up','level'=>'school','date_held'=>'2024-01-15','school_year'=>'2023-2024']],
            '2021-CCS-002' => [['activity'=>'Basketball Intramurals','category'=>'Sports','award'=>'Most Valuable Player','level'=>'school','date_held'=>'2024-01-15','school_year'=>'2023-2024']],
            '2022-CCS-002' => [['activity'=>'Leadership Summit','category'=>'Leadership','award'=>'Best Leader Award','level'=>'school','date_held'=>'2023-10-05','school_year'=>'2023-2024']],
        ];

        if (isset($maps[$student->student_number])) {
            foreach ($maps[$student->student_number] as $rec) {
                StudentNonAcademicRecord::firstOrCreate(
                    ['student_id'=>$student->id,'activity'=>$rec['activity'],'school_year'=>$rec['school_year']],
                    $rec + ['student_id'=>$student->id]
                );
            }
        }
    }

    private function seedSkills(Student $student): void
    {
        $maps = [
            '2021-CCS-001' => [['skill'=>'PHP/Laravel','category'=>'Programming','proficiency'=>'advanced'],['skill'=>'React.js','category'=>'Programming','proficiency'=>'intermediate'],['skill'=>'MySQL','category'=>'Database','proficiency'=>'advanced']],
            '2022-CCS-002' => [['skill'=>'Python','category'=>'Programming','proficiency'=>'advanced'],['skill'=>'Machine Learning','category'=>'Programming','proficiency'=>'intermediate']],
            '2020-CCS-001' => [['skill'=>'Java','category'=>'Programming','proficiency'=>'expert'],['skill'=>'Competitive Programming','category'=>'Programming','proficiency'=>'advanced'],['skill'=>'Public Speaking','category'=>'Soft Skills','proficiency'=>'advanced']],
            '2021-CE-001'  => [['skill'=>'Basketball','category'=>'Sports','proficiency'=>'expert'],['skill'=>'AutoCAD','category'=>'Engineering Tools','proficiency'=>'intermediate']],
            '2022-CE-001'  => [['skill'=>'Basketball','category'=>'Sports','proficiency'=>'advanced'],['skill'=>'3D Modeling','category'=>'Engineering Tools','proficiency'=>'beginner']],
            '2021-CCS-002' => [['skill'=>'Basketball','category'=>'Sports','proficiency'=>'advanced'],['skill'=>'JavaScript','category'=>'Programming','proficiency'=>'intermediate']],
            '2023-CCS-001' => [['skill'=>'Python','category'=>'Programming','proficiency'=>'beginner'],['skill'=>'Volleyball','category'=>'Sports','proficiency'=>'intermediate']],
            '2021-CBA-001' => [['skill'=>'Public Speaking','category'=>'Soft Skills','proficiency'=>'advanced'],['skill'=>'Microsoft Excel','category'=>'Office Tools','proficiency'=>'advanced']],
            '2022-CBA-001' => [['skill'=>'Digital Marketing','category'=>'Marketing','proficiency'=>'intermediate'],['skill'=>'Graphic Design','category'=>'Design','proficiency'=>'intermediate']],
        ];

        if (isset($maps[$student->student_number])) {
            foreach ($maps[$student->student_number] as $skill) {
                StudentSkill::firstOrCreate(
                    ['student_id'=>$student->id,'skill'=>$skill['skill']],
                    $skill + ['student_id'=>$student->id]
                );
            }
        }
    }
}
