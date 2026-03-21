<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\StudentProfileController;

// ── Debug (remove after testing) ──────────────────────────────────────────────
Route::get('/debug', function () {
    try {
        $userCount = \App\Models\User::count();
        return response()->json([
            'status' => 'ok',
            'db' => 'connected',
            'users' => $userCount,
            'db_path' => config('database.connections.sqlite.database'),
        ]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

Route::post('/debug-login', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'received' => $request->all(),
        'content_type' => $request->header('Content-Type'),
        'method' => $request->method(),
    ]);
});
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\EligibilityCriteriaController;
use App\Http\Controllers\Api\AffiliationController;
use App\Http\Controllers\Api\ViolationController;
use App\Http\Controllers\Api\AcademicRecordController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\NonAcademicHistoryController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Auth (public) ─────────────────────────────────────────────────────────────
Route::post('/auth/login',  [AuthController::class, 'login']);
Route::post('/auth/verify-login-otp', [AuthController::class, 'verifyLoginOtp']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
});

// Auth user (Sanctum)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ── Faculty ──────────────────────────────────────────────────────────────────
Route::get('faculties',          [FacultyController::class, 'index']);
Route::get('faculties/{faculty}', [FacultyController::class, 'show']);
Route::put('faculties/{faculty}', [FacultyController::class, 'update']);
Route::patch('faculties/{faculty}', [FacultyController::class, 'update']);
Route::delete('faculties/{faculty}', [FacultyController::class, 'destroy']);
// store requires auth (OTP check inside)
Route::middleware('auth:sanctum')->post('faculties', [FacultyController::class, 'store']);
// Faculty operations from class diagram
Route::post('faculties/{faculty}/create-report/{eligibilityCriterion}',   [FacultyController::class, 'createReport']);
Route::get('faculties/{faculty}/evaluate-student/{student}',              [FacultyController::class, 'evaluateStudent']);
Route::post('faculties/{faculty}/record-violation/{student}',             [FacultyController::class, 'recordViolation']);
Route::patch('faculties/{faculty}/update-student/{student}',              [FacultyController::class, 'updateStudentRecord']);

// ── Students ──────────────────────────────────────────────────────────────────
Route::get('students',           [StudentController::class, 'index']);
Route::get('students/{student}', [StudentController::class, 'show']);
Route::put('students/{student}', [StudentController::class, 'update']);
Route::patch('students/{student}', [StudentController::class, 'update']);
Route::delete('students/{student}', [StudentController::class, 'destroy']);
// store requires auth (OTP check inside)
Route::middleware('auth:sanctum')->post('students', [StudentController::class, 'store']);
// Student operations from class diagram
Route::patch('students/{student}/update-profile',                         [StudentController::class, 'updateProfile']);
Route::post('students/{student}/violations',                              [StudentController::class, 'addViolation']);
Route::post('students/{student}/affiliations',                            [StudentController::class, 'addAffiliation']);
Route::post('students/{student}/skills',                                  [StudentController::class, 'addSkill']);
Route::post('students/{student}/academic-records',                        [StudentController::class, 'addAcademicRecord']);

// ── Subjects ──────────────────────────────────────────────────────────────────
Route::apiResource('subjects', SubjectController::class);
Route::get('subjects/{subject}/info',                                     [SubjectController::class, 'info']);

// ── Grades ───────────────────────────────────────────────────────────────────
Route::apiResource('grades', GradeController::class);
Route::get('grades/{grade}/compute-remarks',                              [GradeController::class, 'computeRemarks']);
Route::get('grades/{grade}/get-score',                                    [GradeController::class, 'getScore']);

// ── Eligibility Criteria ──────────────────────────────────────────────────────
Route::apiResource('eligibility-criteria', EligibilityCriteriaController::class);
Route::get('eligibility-criteria/{eligibilityCriterion}/evaluate/{student}', [EligibilityCriteriaController::class, 'evaluate']);

// ── Affiliations ──────────────────────────────────────────────────────────────
Route::apiResource('affiliations', AffiliationController::class);
Route::get('affiliations/{affiliation}/details',                          [AffiliationController::class, 'details']);

// ── Violations ────────────────────────────────────────────────────────────────
Route::apiResource('violations', ViolationController::class);
Route::get('violations/{violation}/details',                              [ViolationController::class, 'violationDetails']);
Route::patch('violations/{violation}/update-action',                      [ViolationController::class, 'updateAction']);

// ── Academic Records ──────────────────────────────────────────────────────────
Route::apiResource('academic-records', AcademicRecordController::class);
Route::get('academic-records/{academicRecord}/calculate-gpa',             [AcademicRecordController::class, 'calculateGPA']);
Route::post('academic-records/{academicRecord}/add-grade',                [AcademicRecordController::class, 'addGrade']);
Route::get('academic-records/{academicRecord}/get-gpa',                   [AcademicRecordController::class, 'getGPA']);

// ── Skills ────────────────────────────────────────────────────────────────────
Route::apiResource('skills', SkillController::class);
Route::get('skills/{skill}/level',                                        [SkillController::class, 'getSkillLevel']);
Route::patch('skills/{skill}/level',                                      [SkillController::class, 'updateSkillLevel']);

// ── Non-Academic Histories ────────────────────────────────────────────────────
Route::apiResource('non-academic-histories', NonAcademicHistoryController::class);
Route::get('non-academic-histories/{nonAcademicHistory}/details',         [NonAcademicHistoryController::class, 'activityDetails']);
Route::patch('non-academic-histories/{nonAcademicHistory}/update-activity', [NonAcademicHistoryController::class, 'updateActivity']);

// ── Reports (cross-module) ────────────────────────────────────────────────────
Route::prefix('reports')->group(function () {
    Route::get('students',  [ReportController::class, 'students']);
    Route::get('faculties', [ReportController::class, 'faculties']);
    Route::get('summary',   [ReportController::class, 'summary']);
});

// ── Cross-Module Comprehensive Search ─────────────────────────────────────────
Route::get('/search', [ReportController::class, 'search']);

// ── Teacher POV (role: teacher) ───────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:teacher'])->prefix('teacher')->group(function () {
    Route::get('profile',                                    [TeacherController::class, 'profile']);
    Route::patch('profile',                                  [TeacherController::class, 'updateProfile']);
    Route::get('students',                                   [TeacherController::class, 'students']);
    Route::get('evaluate-student/{student}',                 [TeacherController::class, 'evaluateStudent']);
    Route::post('record-violation/{student}',                [TeacherController::class, 'recordViolation']);
    Route::patch('update-student/{student}',                 [TeacherController::class, 'updateStudentRecord']);
    Route::post('create-report/{eligibilityCriterion}',      [TeacherController::class, 'createReport']);
});

// ── Student POV (role: student) ───────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:student'])->prefix('student')->group(function () {
    Route::get('profile',                                    [StudentProfileController::class, 'profile']);
    Route::patch('profile',                                  [StudentProfileController::class, 'updateProfile']);
    Route::post('skills',                                    [StudentProfileController::class, 'addSkill']);
    Route::delete('skills/{skill}',                          [StudentProfileController::class, 'deleteSkill']);
    Route::post('affiliations',                              [StudentProfileController::class, 'addAffiliation']);
    Route::delete('affiliations/{affiliation}',              [StudentProfileController::class, 'deleteAffiliation']);
    Route::get('academic-records',                           [StudentProfileController::class, 'academicRecords']);
    Route::get('violations',                                 [StudentProfileController::class, 'violations']);
    Route::get('non-academic-histories',                     [StudentProfileController::class, 'nonAcademicHistories']);
    Route::post('non-academic-histories',                    [StudentProfileController::class, 'addNonAcademicHistory']);
    Route::delete('non-academic-histories/{nonAcademicHistory}', [StudentProfileController::class, 'deleteNonAcademicHistory']);
});

// ── Admin-only routes (role: admin) ───────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // User management
    Route::get('users',          [AuthController::class, 'listUsers']);
    Route::post('users',         [AuthController::class, 'createUser']);
    Route::patch('users/{user}', [AuthController::class, 'updateUser']);
    Route::delete('users/{user}',[AuthController::class, 'deleteUser']);
});

// ── OTP (admin only) ──────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('otp')->group(function () {
    Route::post('send',   [OtpController::class, 'send']);
    Route::post('verify', [OtpController::class, 'verify']);
});
