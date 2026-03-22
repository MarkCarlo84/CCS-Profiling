<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Student;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::with('department')->withCount('participants');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('category')) {
            $query->where('category', 'like', "%{$request->category}%");
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->filled('date_from')) {
            $query->where('date_start', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('date_start', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%$s%")
                  ->orWhere('organizer', 'like', "%$s%")
                  ->orWhere('venue', 'like', "%$s%");
            });
        }

        return response()->json($query->orderBy('date_start', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'type'             => 'required|in:curricular,extra_curricular',
            'category'         => 'required|string|max:100',
            'organizer'        => 'nullable|string|max:150',
            'venue'            => 'nullable|string|max:200',
            'date_start'       => 'required|date',
            'date_end'         => 'nullable|date|after_or_equal:date_start',
            'description'      => 'nullable|string',
            'status'           => 'in:upcoming,ongoing,completed,cancelled',
            'department_id'    => 'nullable|exists:departments,id',
            'max_participants' => 'nullable|integer|min:1',
        ]);

        $event = Event::create($data);
        return response()->json($event->load('department'), 201);
    }

    public function show(Event $event): JsonResponse
    {
        $event->load(['department', 'participants']);

        // Resolve polymorphic participants
        $event->participants->each(function ($ep) {
            $type = $ep->participable_type;
            if ($type === 'App\\Models\\Student') {
                $ep->participant_info = Student::select('id', 'first_name', 'last_name', 'student_number')
                    ->find($ep->participable_id);
            } elseif ($type === 'App\\Models\\Faculty') {
                $ep->participant_info = Faculty::select('id', 'first_name', 'last_name', 'employee_number')
                    ->find($ep->participable_id);
            }
        });

        return response()->json($event);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'type'             => 'sometimes|in:curricular,extra_curricular',
            'category'         => 'sometimes|string|max:100',
            'organizer'        => 'nullable|string|max:150',
            'venue'            => 'nullable|string|max:200',
            'date_start'       => 'sometimes|date',
            'date_end'         => 'nullable|date|after_or_equal:date_start',
            'description'      => 'nullable|string',
            'status'           => 'in:upcoming,ongoing,completed,cancelled',
            'department_id'    => 'nullable|exists:departments,id',
            'max_participants' => 'nullable|integer|min:1',
        ]);

        $event->update($data);
        return response()->json($event->load('department'));
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();
        return response()->json(['message' => 'Event deleted.']);
    }

    /**
     * Add a participant (Student or Faculty) to an event.
     */
    public function addParticipant(Request $request, Event $event): JsonResponse
    {
        $data = $request->validate([
            'participable_type' => 'required|in:student,faculty',
            'participable_id'   => 'required|integer',
            'role'              => 'in:participant,organizer,judge,facilitator',
            'award'             => 'nullable|string|max:150',
            'remarks'           => 'nullable|string',
        ]);

        $morphType = $data['participable_type'] === 'student'
            ? 'App\\Models\\Student'
            : 'App\\Models\\Faculty';

        $participant = EventParticipant::create([
            'event_id'         => $event->id,
            'participable_type' => $morphType,
            'participable_id'  => $data['participable_id'],
            'role'             => $data['role'] ?? 'participant',
            'award'            => $data['award'] ?? null,
            'remarks'          => $data['remarks'] ?? null,
        ]);

        return response()->json($participant, 201);
    }

    /**
     * Remove a participant from an event.
     */
    public function removeParticipant(Event $event, EventParticipant $participant): JsonResponse
    {
        $participant->delete();
        return response()->json(['message' => 'Participant removed.']);
    }
}
