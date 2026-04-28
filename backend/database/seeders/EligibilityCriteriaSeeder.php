<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EligibilityCriteria;

class EligibilityCriteriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $criteria = [
            [
                'criteria_id' => 'DEAN_LIST',
                'minimum_gpa' => 1.50,
                'required_skill' => null,
                'required_affiliation_type' => null,
                'max_allowed_violations' => 0,
            ],
            [
                'criteria_id' => 'SCHOLARSHIP_ACADEMIC',
                'minimum_gpa' => 1.75,
                'required_skill' => null,
                'required_affiliation_type' => null,
                'max_allowed_violations' => 0,
            ],
            [
                'criteria_id' => 'HONOR_STUDENT',
                'minimum_gpa' => 1.25,
                'required_skill' => null,
                'required_affiliation_type' => null,
                'max_allowed_violations' => 0,
            ],
            [
                'criteria_id' => 'STUDENT_COUNCIL',
                'minimum_gpa' => 2.00,
                'required_skill' => 'Leadership',
                'required_affiliation_type' => 'Student Organization',
                'max_allowed_violations' => 1,
            ],
            [
                'criteria_id' => 'PROGRAMMING_CONTEST',
                'minimum_gpa' => 2.25,
                'required_skill' => 'Programming',
                'required_affiliation_type' => null,
                'max_allowed_violations' => 0,
            ],
            [
                'criteria_id' => 'RESEARCH_ASSISTANT',
                'minimum_gpa' => 1.75,
                'required_skill' => 'Research',
                'required_affiliation_type' => null,
                'max_allowed_violations' => 0,
            ],
            [
                'criteria_id' => 'INTERNSHIP_PROGRAM',
                'minimum_gpa' => 2.50,
                'required_skill' => null,
                'required_affiliation_type' => null,
                'max_allowed_violations' => 2,
            ],
            [
                'criteria_id' => 'THESIS_DEFENSE',
                'minimum_gpa' => 2.00,
                'required_skill' => 'Research',
                'required_affiliation_type' => null,
                'max_allowed_violations' => 1,
            ],
            [
                'criteria_id' => 'GRADUATION_HONORS',
                'minimum_gpa' => 1.50,
                'required_skill' => null,
                'required_affiliation_type' => null,
                'max_allowed_violations' => 0,
            ],
            [
                'criteria_id' => 'CLUB_OFFICER',
                'minimum_gpa' => 2.25,
                'required_skill' => 'Leadership',
                'required_affiliation_type' => 'Student Organization',
                'max_allowed_violations' => 1,
            ],
        ];

        foreach ($criteria as $criterion) {
            EligibilityCriteria::create($criterion);
        }
    }
}