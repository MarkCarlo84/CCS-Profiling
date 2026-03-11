<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\Affiliation;
use App\Models\Violation;
use App\Models\AcademicRecord;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\NonAcademicHistory;
use App\Models\Skill;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $studentsData = [
            ['student_id'=>'2021-CCS-001','first_name'=>'Juan','last_name'=>'Dela Cruz','middle_name'=>'Reyes','age'=>21,'guardian_name'=>'Maria Dela Cruz','date_of_birth'=>'2003-05-10','gender'=>'Male','email'=>'juan.delacruz@student.edu.ph','contact_number'=>'09181000001','address'=>'123 Main St, Manila','enrollment_date'=>'2021-06-01','status'=>'active'],
            ['student_id'=>'2021-CCS-002','first_name'=>'Anna','last_name'=>'Santos','middle_name'=>'Lim','age'=>21,'guardian_name'=>'Jose Santos','date_of_birth'=>'2003-08-22','gender'=>'Female','email'=>'anna.santos@student.edu.ph','contact_number'=>'09181000002','address'=>'456 Rizal Ave, Quezon City','enrollment_date'=>'2021-06-01','status'=>'active'],
            ['student_id'=>'2022-CCS-001','first_name'=>'Mark','last_name'=>'Villanueva','middle_name'=>null,'age'=>20,'guardian_name'=>'Pedro Villanueva','date_of_birth'=>'2004-01-15','gender'=>'Male','email'=>'mark.v@student.edu.ph','contact_number'=>'09181000003','address'=>'789 Bonifacio St, Makati','enrollment_date'=>'2022-06-01','status'=>'active'],
            ['student_id'=>'2022-CCS-002','first_name'=>'Claire','last_name'=>'Mendez','middle_name'=>'Aquino','age'=>20,'guardian_name'=>'Liza Mendez','date_of_birth'=>'2004-03-11','gender'=>'Female','email'=>'claire.m@student.edu.ph','contact_number'=>'09181000004','address'=>'101 Katipunan, Quezon City','enrollment_date'=>'2022-06-01','status'=>'active'],
            ['student_id'=>'2023-CCS-001','first_name'=>'Leo','last_name'=>'Torres','middle_name'=>null,'age'=>19,'guardian_name'=>'Antonio Torres','date_of_birth'=>'2005-09-30','gender'=>'Male','email'=>'leo.t@student.edu.ph','contact_number'=>'09181000005','address'=>'202 España Blvd, Manila','enrollment_date'=>'2023-06-01','status'=>'active'],
            ['student_id'=>'2020-CCS-001','first_name'=>'Grace','last_name'=>'Navarro','middle_name'=>'Cruz','age'=>22,'guardian_name'=>'Ricardo Navarro','date_of_birth'=>'2002-11-05','gender'=>'Female','email'=>'grace.n@student.edu.ph','contact_number'=>'09181000006','address'=>'303 Taft Ave, Manila','enrollment_date'=>'2020-06-01','status'=>'active'],
            ['student_id'=>'2021-CE-001','first_name'=>'Kevin','last_name'=>'Bautista','middle_name'=>null,'age'=>21,'guardian_name'=>'Elena Bautista','date_of_birth'=>'2003-06-14','gender'=>'Male','email'=>'kevin.b@student.edu.ph','contact_number'=>'09181000007','address'=>'404 Commonwealth, Quezon City','enrollment_date'=>'2021-06-01','status'=>'active'],
            ['student_id'=>'2022-CE-001','first_name'=>'Diana','last_name'=>'Garcia','middle_name'=>'Reyes','age'=>20,'guardian_name'=>'Fernando Garcia','date_of_birth'=>'2004-07-19','gender'=>'Female','email'=>'diana.g@student.edu.ph','contact_number'=>'09181000008','address'=>'505 EDSA, Pasay','enrollment_date'=>'2022-06-01','status'=>'active'],
            ['student_id'=>'2021-CBA-001','first_name'=>'Patrick','last_name'=>'Lopez','middle_name'=>'Santos','age'=>21,'guardian_name'=>'Carmen Lopez','date_of_birth'=>'2003-02-28','gender'=>'Male','email'=>'patrick.l@student.edu.ph','contact_number'=>'09181000009','address'=>'606 Ortigas, Pasig','enrollment_date'=>'2021-06-01','status'=>'active'],
            ['student_id'=>'2022-CBA-001','first_name'=>'Sofia','last_name'=>'Flores','middle_name'=>null,'age'=>20,'guardian_name'=>'Miguel Flores','date_of_birth'=>'2004-04-25','gender'=>'Female','email'=>'sofia.f@student.edu.ph','contact_number'=>'09181000010','address'=>'707 Ayala Ave, Makati','enrollment_date'=>'2022-06-01','status'=>'active'],
        ];

        foreach ($studentsData as $sData) {
            $student = Student::firstOrCreate(['student_id' => $sData['student_id']], $sData);
            $this->seedAffiliations($student);
            $this->seedViolations($student);
            $this->seedAcademicRecords($student);
            $this->seedNonAcademicHistories($student);
            $this->seedSkills($student);
        }
    }

    private function seedAffiliations(Student $student): void
    {
        $maps = [
            '2021-CCS-001' => [
                ['name'=>'Junior Philippine Computer Society','type'=>'Academic','role'=>'President','date_joined'=>'2021-08-01'],
                ['name'=>'Google Developer Student Club','type'=>'Academic','role'=>'Member','date_joined'=>'2022-08-01'],
            ],
            '2022-CCS-002' => [
                ['name'=>'Junior Philippine Computer Society','type'=>'Academic','role'=>'Vice President','date_joined'=>'2022-08-01'],
            ],
            '2020-CCS-001' => [
                ['name'=>'Junior Philippine Computer Society','type'=>'Academic','role'=>'Secretary','date_joined'=>'2020-08-01'],
                ['name'=>'University Supreme Council','type'=>'Government','role'=>'Senator','date_joined'=>'2023-06-01'],
            ],
            '2021-CE-001'  => [
                ['name'=>'Institute of Civil Engineers Philippines','type'=>'Professional','role'=>'Member','date_joined'=>'2021-08-01'],
            ],
            '2021-CBA-001' => [
                ['name'=>'Junior Marketing Association','type'=>'Academic','role'=>'Treasurer','date_joined'=>'2021-08-01'],
            ],
        ];

        if (isset($maps[$student->student_id])) {
            foreach ($maps[$student->student_id] as $aff) {
                Affiliation::firstOrCreate(
                    ['student_id' => $student->id, 'name' => $aff['name']],
                    $aff + ['student_id' => $student->id]
                );
            }
        }
    }

    private function seedViolations(Student $student): void
    {
        $maps = [
            '2021-CCS-002' => [['violation_type'=>'Tardiness','description'=>'Late 3 times in a week','date_committed'=>'2023-09-10','severity_level'=>'minor','action_taken'=>'Warning letter']],
            '2022-CCS-001' => [['violation_type'=>'Academic Dishonesty','description'=>'Caught cheating during exam','date_committed'=>'2023-11-15','severity_level'=>'major','action_taken'=>'Grade of 5.0 in subject']],
            '2021-CBA-001' => [['violation_type'=>'Dress Code Violation','description'=>'Not wearing uniform','date_committed'=>'2024-01-20','severity_level'=>'minor','action_taken'=>'Community service']],
        ];

        if (isset($maps[$student->student_id])) {
            foreach ($maps[$student->student_id] as $vio) {
                Violation::firstOrCreate(
                    ['student_id' => $student->id, 'violation_type' => $vio['violation_type'], 'date_committed' => $vio['date_committed']],
                    $vio + ['student_id' => $student->id]
                );
            }
        }
    }

    private function seedAcademicRecords(Student $student): void
    {
        $recordsByStudentId = [
            '2021-CCS-001' => ['school_year'=>'2023-2024','semester'=>'1st Semester','subjects'=>[
                ['subject_code'=>'CC301','subject_name'=>'Software Engineering','score'=>1.25],
                ['subject_code'=>'CC302','subject_name'=>'Database Systems','score'=>1.50],
            ]],
            '2022-CCS-002' => ['school_year'=>'2023-2024','semester'=>'1st Semester','subjects'=>[
                ['subject_code'=>'CC201','subject_name'=>'Data Structures','score'=>1.00],
                ['subject_code'=>'CC202','subject_name'=>'Algorithms','score'=>1.25],
            ]],
            '2020-CCS-001' => ['school_year'=>'2023-2024','semester'=>'1st Semester','subjects'=>[
                ['subject_code'=>'CC401','subject_name'=>'Capstone Project','score'=>1.00],
                ['subject_code'=>'CC402','subject_name'=>'Advanced Programming','score'=>1.25],
            ]],
        ];

        if (isset($recordsByStudentId[$student->student_id])) {
            $data = $recordsByStudentId[$student->student_id];
            $record = AcademicRecord::firstOrCreate(
                ['student_id' => $student->id, 'school_year' => $data['school_year'], 'semester' => $data['semester']],
                ['student_id' => $student->id, 'school_year' => $data['school_year'], 'semester' => $data['semester']]
            );
            foreach ($data['subjects'] as $sub) {
                $subject = Subject::firstOrCreate(
                    ['subject_code' => $sub['subject_code']],
                    ['subject_code' => $sub['subject_code'], 'subject_name' => $sub['subject_name'], 'units' => 3]
                );
                Grade::firstOrCreate(
                    ['academic_record_id' => $record->id, 'subject_id' => $subject->id],
                    ['academic_record_id' => $record->id, 'subject_id' => $subject->id, 'subject_name' => $sub['subject_name'], 'score' => $sub['score'], 'remarks' => $this->computeRemarks($sub['score'])]
                );
            }
            $record->calculateGPA();
        }
    }

    private function seedNonAcademicHistories(Student $student): void
    {
        $maps = [
            '2021-CCS-001' => [['activity_title'=>'Regional Programming Contest','category'=>'Academic','description'=>'Competed in regional level contest','date_started'=>'2023-11-20','date_ended'=>'2023-11-20','role'=>'Contestant','organizer'=>'CHED','game_result'=>'Champion']],
            '2020-CCS-001' => [['activity_title'=>'National Coding Olympiad','category'=>'Academic','description'=>'National level programming competition','date_started'=>'2023-12-10','date_ended'=>'2023-12-10','role'=>'Contestant','organizer'=>'DICT','game_result'=>'2nd Place']],
            '2021-CE-001'  => [['activity_title'=>'Basketball Intramurals','category'=>'Sports','description'=>'College basketball tournament','date_started'=>'2024-01-15','date_ended'=>'2024-01-20','role'=>'Player','organizer'=>'SSG','game_result'=>'Champion']],
            '2022-CE-001'  => [['activity_title'=>'Basketball Intramurals','category'=>'Sports','description'=>'College basketball tournament','date_started'=>'2024-01-15','date_ended'=>'2024-01-20','role'=>'Player','organizer'=>'SSG','game_result'=>'Runner-Up']],
            '2022-CCS-002' => [['activity_title'=>'Leadership Summit','category'=>'Leadership','description'=>'Annual student leadership training','date_started'=>'2023-10-05','date_ended'=>'2023-10-06','role'=>'Delegate','organizer'=>'SSG','game_result'=>'Best Leader Award']],
        ];

        if (isset($maps[$student->student_id])) {
            foreach ($maps[$student->student_id] as $rec) {
                NonAcademicHistory::firstOrCreate(
                    ['student_id' => $student->id, 'activity_title' => $rec['activity_title']],
                    $rec + ['student_id' => $student->id]
                );
            }
        }
    }

    private function seedSkills(Student $student): void
    {
        $maps = [
            '2021-CCS-001' => [['skill_name'=>'PHP/Laravel','skill_level'=>'advanced','certification'=>false],['skill_name'=>'React.js','skill_level'=>'intermediate','certification'=>false],['skill_name'=>'MySQL','skill_level'=>'advanced','certification'=>true]],
            '2022-CCS-002' => [['skill_name'=>'Python','skill_level'=>'advanced','certification'=>false],['skill_name'=>'Machine Learning','skill_level'=>'intermediate','certification'=>false]],
            '2020-CCS-001' => [['skill_name'=>'Java','skill_level'=>'expert','certification'=>true],['skill_name'=>'Competitive Programming','skill_level'=>'advanced','certification'=>false],['skill_name'=>'Public Speaking','skill_level'=>'advanced','certification'=>false]],
            '2021-CE-001'  => [['skill_name'=>'Basketball','skill_level'=>'expert','certification'=>false],['skill_name'=>'AutoCAD','skill_level'=>'intermediate','certification'=>true]],
            '2022-CE-001'  => [['skill_name'=>'Basketball','skill_level'=>'advanced','certification'=>false],['skill_name'=>'3D Modeling','skill_level'=>'beginner','certification'=>false]],
            '2021-CCS-002' => [['skill_name'=>'Basketball','skill_level'=>'advanced','certification'=>false],['skill_name'=>'JavaScript','skill_level'=>'intermediate','certification'=>false]],
            '2023-CCS-001' => [['skill_name'=>'Python','skill_level'=>'beginner','certification'=>false],['skill_name'=>'Volleyball','skill_level'=>'intermediate','certification'=>false]],
            '2021-CBA-001' => [['skill_name'=>'Public Speaking','skill_level'=>'advanced','certification'=>false],['skill_name'=>'Microsoft Excel','skill_level'=>'advanced','certification'=>true]],
            '2022-CBA-001' => [['skill_name'=>'Digital Marketing','skill_level'=>'intermediate','certification'=>false],['skill_name'=>'Graphic Design','skill_level'=>'intermediate','certification'=>false]],
        ];

        if (isset($maps[$student->student_id])) {
            foreach ($maps[$student->student_id] as $skill) {
                Skill::firstOrCreate(
                    ['student_id' => $student->id, 'skill_name' => $skill['skill_name']],
                    $skill + ['student_id' => $student->id]
                );
            }
        }
    }

    private function computeRemarks(float $score): string
    {
        if ($score <= 1.0) return 'Excellent';
        if ($score <= 1.5) return 'Very Good';
        if ($score <= 2.0) return 'Good';
        if ($score <= 2.5) return 'Satisfactory';
        if ($score <= 3.0) return 'Passed';
        return 'Failed';
    }
}
