<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Room::query();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('building')) {
            $query->where('building', 'like', "%{$request->building}%");
        }
        if ($request->filled('is_available')) {
            $query->where('is_available', filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('building', 'like', "%$s%")
                  ->orWhere('room_number', 'like', "%$s%");
            });
        }

        return response()->json($query->orderBy('building')->orderBy('room_number')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'building'     => 'required|string|max:100',
            'room_number'  => 'required|string|max:20',
            'name'         => 'nullable|string|max:100',
            'type'         => 'required|in:classroom,lab,lecture_hall,seminar_room',
            'capacity'     => 'integer|min:1|max:1000',
            'is_available' => 'boolean',
            'remarks'      => 'nullable|string',
        ]);

        $room = Room::create($data);
        return response()->json($room, 201);
    }

    public function show(Room $room): JsonResponse
    {
        return response()->json($room->load('schedules'));
    }

    public function update(Request $request, Room $room): JsonResponse
    {
        $data = $request->validate([
            'building'     => 'sometimes|string|max:100',
            'room_number'  => 'sometimes|string|max:20',
            'name'         => 'nullable|string|max:100',
            'type'         => 'sometimes|in:classroom,lab,lecture_hall,seminar_room',
            'capacity'     => 'integer|min:1|max:1000',
            'is_available' => 'boolean',
            'remarks'      => 'nullable|string',
        ]);

        $room->update($data);
        return response()->json($room);
    }

    public function destroy(Room $room): JsonResponse
    {
        $room->delete();
        return response()->json(['message' => 'Room deleted.']);
    }
}
