<?php

use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\CurriculumController;
use App\Http\Controllers\Api\SyllabusController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\EventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth user (Sanctum)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Departments (read-only for frontend)
Route::get('/departments', function () {
    return response()->json(\App\Models\Department::orderBy('name')->get());
});

// Faculty
Route::apiResource('faculties', FacultyController::class);

// Students
Route::apiResource('students', StudentController::class);

// Reports
Route::prefix('reports')->group(function () {
    Route::get('students',  [ReportController::class, 'students']);
    Route::get('faculties', [ReportController::class, 'faculties']);
    Route::get('summary',   [ReportController::class, 'summary']);
});

// ── Module: Instruction ──────────────────────────────────────────────────────
Route::apiResource('curricula', CurriculumController::class);
Route::apiResource('syllabi',   SyllabusController::class);
Route::apiResource('lessons',   LessonController::class);

// ── Module: Scheduling ───────────────────────────────────────────────────────
Route::apiResource('courses',   CourseController::class);
Route::apiResource('sections',  SectionController::class);
Route::apiResource('rooms',     RoomController::class);
Route::apiResource('schedules', ScheduleController::class);

// ── Module: Events ───────────────────────────────────────────────────────────
Route::apiResource('events', EventController::class);
Route::post('events/{event}/participants',              [EventController::class, 'addParticipant']);
Route::delete('events/{event}/participants/{participant}', [EventController::class, 'removeParticipant']);

// ── Cross-Module Comprehensive Search ────────────────────────────────────────
Route::get('/search', [ReportController::class, 'search']);
