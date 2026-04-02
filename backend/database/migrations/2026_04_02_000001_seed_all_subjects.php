<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $IT = 'Information Technology';
        $CS = 'Computer Science';

        $subjects = [
            // ── Information Technology ────────────────────────────────────────
            // 1st Year – 1st Sem
            ['CCS101','Introduction to Computing',              3,'1st Year','1st Semester',null,          $IT],
            ['CCS102','Computer Programming 1',                 3,'1st Year','1st Semester',null,          $IT],
            ['ETH101','Ethics',                                 3,'1st Year','1st Semester',null,          $IT],
            ['MAT101','Mathematics in the Modern World',        3,'1st Year','1st Semester',null,          $IT],
            ['NSTP1', 'National Service Training Program 1',    3,'1st Year','1st Semester',null,          $IT],
            ['PED101','Physical Education 1',                   2,'1st Year','1st Semester',null,          $IT],
            ['PSY100','Understanding the Self',                 3,'1st Year','1st Semester',null,          $IT],
            // 1st Year – 2nd Sem
            ['CCS103','Computer Programming 2',                 3,'1st Year','2nd Semester','CCS102',      $IT],
            ['CCS104','Discrete Structures 1',                  3,'1st Year','2nd Semester','MAT101',      $IT],
            ['CCS105','Human Computer Interaction 1',           3,'1st Year','2nd Semester','CCS101',      $IT],
            ['CCS106','Social and Professional Issues',         3,'1st Year','2nd Semester','ETH101',      $IT],
            ['COM101','Purposive Communication',                3,'1st Year','2nd Semester',null,          $IT],
            ['GAD101','Gender and Development',                 3,'1st Year','2nd Semester',null,          $IT],
            ['NSTP2', 'National Service Training Program 2',    3,'1st Year','2nd Semester','NSTP1',       $IT],
            ['PED102','Physical Education 2',                   2,'1st Year','2nd Semester','PED101',      $IT],
            // 2nd Year – 1st Sem
            ['ACT101','Principles of Accounting',               3,'2nd Year','1st Semester',null,          $IT],
            ['CCS107','Data Structures and Algorithms 1',       3,'2nd Year','1st Semester','CCS103',      $IT],
            ['CCS108','Object-Oriented Programming',            3,'2nd Year','1st Semester','CCS103',      $IT],
            ['CCS109','System Analysis and Design',             3,'2nd Year','1st Semester','CCS101',      $IT],
            ['ITEW1', 'Electronic Commerce',                    3,'2nd Year','1st Semester',null,          $IT],
            ['PED103','Physical Education 3',                   2,'2nd Year','1st Semester','PED102',      $IT],
            ['STS101','Science, Technology and Society',        3,'2nd Year','1st Semester',null,          $IT],
            // 2nd Year – 2nd Sem
            ['CCS110','Information Management 1',               3,'2nd Year','2nd Semester','CCS101',      $IT],
            ['CCS111','Networking and Communication 1',         3,'2nd Year','2nd Semester','CCS103, CCS104, CCS105, CCS106', $IT],
            ['ENT101','The Entrepreneurial Mind',               3,'2nd Year','2nd Semester',null,          $IT],
            ['ITEW2', 'Client Side Scripting',                  3,'2nd Year','2nd Semester','ITEW1',       $IT],
            ['ITP101','Quantitative Methods',                   3,'2nd Year','2nd Semester','CCS104',      $IT],
            ['ITP102','Integrative Programming and Technologies',3,'2nd Year','2nd Semester','CCS109',     $IT],
            ['PED104','Physical Education 4',                   2,'2nd Year','2nd Semester','PED103',      $IT],
            // 3rd Year – 1st Sem
            ['HIS101','Readings in Philippine History',         3,'3rd Year','1st Semester',null,          $IT],
            ['ITEW3', 'Server Side Scripting',                  3,'3rd Year','1st Semester','ITEW2',       $IT],
            ['ITP103','System Integration and Architecture',    3,'3rd Year','1st Semester','ITP102',      $IT],
            ['ITP104','Information Management 2',               3,'3rd Year','1st Semester','CCS110',      $IT],
            ['ITP105','Networking and Communication 2',         3,'3rd Year','1st Semester','CCS111',      $IT],
            ['ITP106','Human Computer Interaction 2',           3,'3rd Year','1st Semester','CCS105',      $IT],
            ['SOC101','The Contemporary World',                 3,'3rd Year','1st Semester',null,          $IT],
            ['TEC101','Technopreneurship',                      3,'3rd Year','1st Semester','ENT101',      $IT],
            // 3rd Year – 2nd Sem
            ['CCS112','Applications Development and Emerging Technologies',3,'3rd Year','2nd Semester','CCS103',$IT],
            ['CCS113','Information Assurance and Security',     3,'3rd Year','2nd Semester','3rd Year Standing',$IT],
            ['HMN101','Art Appreciation',                       3,'3rd Year','2nd Semester',null,          $IT],
            ['ITEW4', 'Responsive Web Design',                  3,'3rd Year','2nd Semester','ITEW3',       $IT],
            ['ITP107','Mobile Application Development',         3,'3rd Year','2nd Semester','CCS108',      $IT],
            ['ITP108','Capstone Project 1',                     3,'3rd Year','2nd Semester','ITP104, CCS108, ITP103, ITP105, ITP106, ITEW3',$IT],
            ['ITP109','Platform Technologies',                  3,'3rd Year','2nd Semester','ITP106',      $IT],
            // 4th Year – 1st Sem
            ['ENV101','Environmental Science',                  3,'4th Year','1st Semester',null,          $IT],
            ['ITEW5', 'Web Security and Optimization',          3,'4th Year','1st Semester','ITEW4',       $IT],
            ['ITP110','Web Technologies',                       3,'4th Year','1st Semester','ITP106',      $IT],
            ['ITP111','System Administration and Maintenance',  3,'4th Year','1st Semester','ITP105, ITP109',$IT],
            ['ITP112','Capstone Project 2',                     3,'4th Year','1st Semester','ITP108',      $IT],
            ['RIZ101','Life and Works of Rizal',                3,'4th Year','1st Semester',null,          $IT],
            // 4th Year – 2nd Sem
            ['ITEW6', 'Web Development Frameworks',             3,'4th Year','2nd Semester','ITEW5',       $IT],
            ['ITP113','IT Practicum (500 hours)',                9,'4th Year','2nd Semester','ITP108',      $IT],

            // ── Computer Science ──────────────────────────────────────────────
            // 1st Year – 1st Sem
            ['CCS101','Introduction to Computing',              3,'1st Year','1st Semester',null,          $CS],
            ['CCS102','Computer Programming 1',                 3,'1st Year','1st Semester',null,          $CS],
            ['ETH101','Ethics',                                 3,'1st Year','1st Semester',null,          $CS],
            ['MAT101','Mathematics in the Modern World',        3,'1st Year','1st Semester',null,          $CS],
            ['NSTP1', 'National Service Training Program 1',    3,'1st Year','1st Semester',null,          $CS],
            ['PED101','Physical Education 1',                   2,'1st Year','1st Semester',null,          $CS],
            ['PSY100','Understanding the Self',                 3,'1st Year','1st Semester',null,          $CS],
            // 1st Year – 2nd Sem
            ['CCS103','Computer Programming 2',                 3,'1st Year','2nd Semester','CCS102',      $CS],
            ['CCS104','Discrete Structures 1',                  3,'1st Year','2nd Semester','MAT101',      $CS],
            ['CCS106','Social and Professional Issues',         3,'1st Year','2nd Semester','ETH101',      $CS],
            ['COM101','Purposive Communication',                3,'1st Year','2nd Semester',null,          $CS],
            ['CSP101','Analytic Geometry',                      3,'1st Year','2nd Semester','MAT101',      $CS],
            ['GAD101','Gender and Development',                 3,'1st Year','2nd Semester',null,          $CS],
            ['NSTP2', 'National Service Training Program 2',    3,'1st Year','2nd Semester','NSTP1',       $CS],
            ['PED102','Physical Education 2',                   2,'1st Year','2nd Semester','PED101',      $CS],
            // 2nd Year – 1st Sem
            ['CCS107','Data Structures and Algorithms 1',       3,'2nd Year','1st Semester','CCS103',      $CS],
            ['CCS108','Object-Oriented Programming',            3,'2nd Year','1st Semester','CCS103',      $CS],
            ['CSEG1', 'Game Concepts and Productions',          3,'2nd Year','1st Semester','2nd Year Standing',$CS],
            ['CSP102','Discrete Structures 2',                  3,'2nd Year','1st Semester','CCS104',      $CS],
            ['HIS101','Readings in Philippine History',         3,'2nd Year','1st Semester',null,          $CS],
            ['PED103','Physical Education 3',                   2,'2nd Year','1st Semester','PED102',      $CS],
            ['STS101','Science, Technology and Society',        3,'2nd Year','1st Semester',null,          $CS],
            // 2nd Year – 2nd Sem
            ['ACT101','Principles of Accounting',               3,'2nd Year','2nd Semester',null,          $CS],
            ['CCS110','Information Management 1',               3,'2nd Year','2nd Semester','CCS101',      $CS],
            ['CSEG2', 'Game Programming 1',                     3,'2nd Year','2nd Semester','CSEG1',       $CS],
            ['CSP103','Data Structures and Algorithms 2',       3,'2nd Year','2nd Semester','CCS107',      $CS],
            ['CSP104','Calculus',                               3,'2nd Year','2nd Semester','CSP101, CSP102',$CS],
            ['CSP105','Algorithms and Complexity',              3,'2nd Year','2nd Semester','CCS107, CCS108',$CS],
            ['HMN101','Art Appreciation',                       3,'2nd Year','2nd Semester',null,          $CS],
            ['PED104','Physical Education 4',                   2,'2nd Year','2nd Semester','PED103',      $CS],
            // 3rd Year – 1st Sem
            ['CCS109','System Analysis and Design',             3,'3rd Year','1st Semester','CCS101',      $CS],
            ['CCS112','Applications Development and Emerging Technologies',3,'3rd Year','1st Semester','CCS103',$CS],
            ['CCS113','Information Assurance Security',         3,'3rd Year','1st Semester','PED104, HMN101, ACT101, CCS110, CSP103, CSP104, CSP105, CSEG2',$CS],
            ['CSEG3', 'Game Programming 2',                     3,'3rd Year','1st Semester','CSEG2',       $CS],
            ['CSP106','Automata Theory and Formal Languages',   3,'3rd Year','1st Semester','CSP105',      $CS],
            ['CSP107','Computer Organization and Assembly Language Programming',3,'3rd Year','1st Semester','CSP103',$CS],
            ['ENT101','The Entrepreneurial Mind',               3,'3rd Year','1st Semester',null,          $CS],
            // 3rd Year – 2nd Sem
            ['CSEG4', 'Game Programming 3 (Pure Labs)',         3,'3rd Year','2nd Semester','CSEG3',       $CS],
            ['CSP108','Programming Languages',                  3,'3rd Year','2nd Semester','CCS103',      $CS],
            ['CSP109','Software Engineering 1',                 3,'3rd Year','2nd Semester','CCS109',      $CS],
            ['CSP110','Numerical Analysis',                     3,'3rd Year','2nd Semester','CSP106, CSEG3',$CS],
            ['CSP111','Thesis 1',                               3,'3rd Year','2nd Semester','CSP106, CSP107',$CS],
            ['RIZ101','Life and Works of Rizal',                3,'3rd Year','2nd Semester',null,          $CS],
            ['SOC101','The Contemporary World',                 3,'3rd Year','2nd Semester',null,          $CS],
            ['TEC101','Technopreneurship',                      3,'3rd Year','2nd Semester','ENT101',      $CS],
            // 4th Year – 1st Sem
            ['CCS105','Human Computer Interaction 1',           3,'4th Year','1st Semester','CCS101',      $CS],
            ['CSEG5', 'Artificial Intelligence for Games',      3,'4th Year','1st Semester','CSEG4',       $CS],
            ['CSP112','Operating Systems',                      3,'4th Year','1st Semester','CSP107',      $CS],
            ['CSP113','Software Engineering 2',                 3,'4th Year','1st Semester','CSP109',      $CS],
            ['CSP114','Thesis 2',                               3,'4th Year','1st Semester','CSP111',      $CS],
            ['ENV101','Environmental Science',                  3,'4th Year','1st Semester',null,          $CS],
            // 4th Year – 2nd Sem
            ['CCS111','Networking and Communication 1',         3,'4th Year','2nd Semester','CSP112',      $CS],
            ['CSEG6', 'Advance Game Design',                    3,'4th Year','2nd Semester','CSEG5',       $CS],
            ['CSP115','CS Practicum (300 hours)',                4,'4th Year','2nd Semester','CSP111',      $CS],
        ];

        $now = now();
        foreach ($subjects as [$code, $name, $units, $year, $sem, $pre, $prog]) {
            DB::table('subjects')->updateOrInsert(
                ['subject_code' => $code, 'program' => $prog],
                [
                    'subject_name'  => $name,
                    'units'         => $units,
                    'year_level'    => $year,
                    'semester'      => $sem,
                    'pre_requisite' => $pre,
                    'updated_at'    => $now,
                    'created_at'    => $now,
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('subjects')->truncate();
    }
};
