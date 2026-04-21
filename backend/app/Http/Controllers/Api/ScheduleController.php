<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Schedule::with(['section.course.department', 'faculty', 'room']);

        if ($request->filled('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }
        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }
        if ($request->filled('section_id')) {
            $query->where('section_id', $request->section_id);
        }
        if ($request->filled('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('school_year')) {
            $query->where('school_year', $request->school_year);
        }

        $dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        $schedules = $query->orderByRaw("FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')")
            ->orderBy('time_start')
            ->get();

        return response()->json($schedules);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'section_id'  => 'required|exists:sections,id',
            'faculty_id'  => 'nullable|exists:faculties,id',
            'room_id'     => 'nullable|exists:rooms,id',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'time_start'  => 'required|date_format:H:i',
            'time_end'    => 'required|date_format:H:i|after:time_start',
            'semester'    => 'required|in:1st,2nd,summer',
            'school_year' => 'required|string|max:20',
            'remarks'     => 'nullable|string',
        ]);

        $schedule = Schedule::create($data);
        return response()->json($schedule->load(['section.course', 'faculty', 'room']), 201);
    }

    public function show(Schedule $schedule): JsonResponse
    {
        return response()->json($schedule->load(['section.course.department', 'faculty', 'room']));
    }

    public function update(Request $request, Schedule $schedule): JsonResponse
    {
        $data = $request->validate([
            'section_id'  => 'sometimes|exists:sections,id',
            'faculty_id'  => 'nullable|exists:faculties,id',
            'room_id'     => 'nullable|exists:rooms,id',
            'day_of_week' => 'sometimes|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'time_start'  => 'sometimes|date_format:H:i',
            'time_end'    => 'sometimes|date_format:H:i',
            'semester'    => 'sometimes|in:1st,2nd,summer',
            'school_year' => 'sometimes|string|max:20',
            'remarks'     => 'nullable|string',
        ]);

        $schedule->update($data);
        return response()->json($schedule->load(['section.course', 'faculty', 'room']));
    }

    public function destroy(Schedule $schedule): JsonResponse
    {
        $schedule->delete();
        return response()->json(['message' => 'Schedule deleted.']);
    }
}
