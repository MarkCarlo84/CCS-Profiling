<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Skill;
use App\Models\Affiliation;
use App\Models\Violation;
use App\Models\AcademicRecord;
use App\Models\Grade;
use App\Services\CacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

class PerformanceOptimizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data
        $this->createTestData();
    }

    private function createTestData()
    {
        // Create students
        $students = Student::factory(10)->create();
        
        // Create faculty
        $faculty = Faculty::factory(5)->create();
        
        // Create skills for students
        foreach ($students as $student) {
            Skill::factory(2)->create(['student_id' => $student->id]);
            Affiliation::factory(1)->create(['student_id' => $student->id]);
        }
        
        // Create some violations
        Violation::factory(3)->create(['student_id' => $students->first()->id]);
    }

    /** @test */
    public function test_report_students_endpoint_returns_correct_format()
    {
        $response = $this->getJson('/api/reports/students');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'count',
            'students',
            'pagination' => [
                'current_page',
                'last_page',
                'per_page',
                'total'
            ]
        ]);
    }

    /** @test */
    public function test_report_students_with_pagination_parameter()
    {
        $response = $this->getJson('/api/reports/students?paginated=true');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'current_page',
            'last_page',
            'per_page',
            'total'
        ]);
    }

    /** @test */
    public function test_report_students_with_filters()
    {
        // Test skill filter
        $response = $this->getJson('/api/reports/students?skill=programming');
        $response->assertStatus(200);
        
        // Test status filter
        $response = $this->getJson('/api/reports/students?status=active');
        $response->assertStatus(200);
        
        // Test violation filter
        $response = $this->getJson('/api/reports/students?has_violation=true');
        $response->assertStatus(200);
    }

    /** @test */
    public function test_student_index_with_selective_loading()
    {
        // Test without details
        $response = $this->getJson('/api/students');
        $response->assertStatus(200);
        
        // Test with basic relations
        $response = $this->getJson('/api/students?with_basic_relations=true');
        $response->assertStatus(200);
        
        // Test with full details
        $response = $this->getJson('/api/students?with_details=true');
        $response->assertStatus(200);
    }

    /** @test */
    public function test_student_show_returns_optimized_data()
    {
        $student = Student::first();
        
        $response = $this->getJson("/api/students/{$student->id}");
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'first_name',
            'last_name',
            'violations',
            'affiliations',
            'academic_records',
            'skills',
            'non_academic_histories'
        ]);
    }

    /** @test */
    public function test_faculty_evaluation_summary_uses_database_aggregation()
    {
        $response = $this->getJson('/api/admin/faculty-evaluations/summary');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id',
                'first_name',
                'last_name',
                'department',
                'position',
                'evaluation_count',
                'average_rating'
            ]
        ]);
    }

    /** @test */
    public function test_search_endpoint_returns_limited_data()
    {
        $response = $this->getJson('/api/reports/search?q=test');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'query',
            'total',
            'students',
            'faculties',
            'courses',
            'events'
        ]);
        
        $data = $response->json();
        $this->assertLessThanOrEqual(20, count($data['students']));
        $this->assertLessThanOrEqual(20, count($data['faculties']));
    }

    /** @test */
    public function test_cache_service_methods()
    {
        // Clear cache first
        Cache::flush();
        
        // Test faculty list caching
        $faculties1 = CacheService::getFacultyList();
        $faculties2 = CacheService::getFacultyList();
        
        $this->assertEquals($faculties1, $faculties2);
        
        // Test dashboard summary caching
        $summary1 = CacheService::getDashboardSummary();
        $summary2 = CacheService::getDashboardSummary();
        
        $this->assertEquals($summary1, $summary2);
        
        // Test cache invalidation
        CacheService::clear('faculty_list');
        $this->assertFalse(Cache::has('faculty_list'));
    }

    /** @test */
    public function test_pagination_limits_are_enforced()
    {
        // Test default pagination
        $response = $this->getJson('/api/students');
        $data = $response->json();
        $this->assertLessThanOrEqual(20, count($data['data']));
        
        // Test custom per_page
        $response = $this->getJson('/api/students?per_page=5');
        $data = $response->json();
        $this->assertLessThanOrEqual(5, count($data['data']));
        
        // Test maximum limit enforcement
        $response = $this->getJson('/api/students?per_page=500');
        $data = $response->json();
        $this->assertLessThanOrEqual(200, $data['per_page']);
    }

    /** @test */
    public function test_whereExists_queries_work_correctly()
    {
        // Create a student with specific skill
        $student = Student::first();
        Skill::create([
            'student_id' => $student->id,
            'skill_name' => 'Laravel Development',
            'skill_level' => 'Expert',
            'certification' => true
        ]);
        
        // Test skill filter
        $response = $this->getJson('/api/reports/students?skill=Laravel');
        $response->assertStatus(200);
        
        $data = $response->json();
        $this->assertGreaterThan(0, $data['count']);
        
        // Test certification filter
        $response = $this->getJson('/api/reports/students?certification=true');
        $response->assertStatus(200);
        
        $data = $response->json();
        $this->assertGreaterThan(0, $data['count']);
    }

    /** @test */
    public function test_academic_record_batch_insert_works()
    {
        $student = Student::first();
        
        $response = $this->postJson('/api/admin/academic-records', [
            'student_id_number' => $student->student_id,
            'school_year' => '2023-2024',
            'semester' => '1st',
            'year_level' => 1,
            'is_irregular' => false
        ]);
        
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'records_created',
            'records_skipped',
            'is_regular'
        ]);
        
        // Verify academic record was created
        $this->assertDatabaseHas('academic_records', [
            'student_id' => $student->id,
            'school_year' => '2023-2024',
            'semester' => '1st',
            'year_level' => 1
        ]);
    }

    /** @test */
    public function test_response_format_backward_compatibility()
    {
        // Test original format (default)
        $response = $this->getJson('/api/reports/students');
        $response->assertJsonStructure([
            'count',
            'students',
            'pagination'
        ]);
        
        // Test new paginated format
        $response = $this->getJson('/api/reports/students?paginated=true');
        $response->assertJsonStructure([
            'data',
            'current_page',
            'last_page'
        ]);
    }
}