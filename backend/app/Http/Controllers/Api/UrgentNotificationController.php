<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UrgentNotificationResource;
use App\Models\UrgentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UrgentNotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'psychologist') {
            return response()->json(['message' => 'Недоступно'], 403);
        }

        $items = UrgentNotification::where('psychologist_id', $user->id)
            ->where('is_acknowledged', false)
            ->with(['message', 'child'])
            ->orderByDesc('created_at')
            ->get();

        return UrgentNotificationResource::collection($items);
    }

    public function count(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'psychologist') {
            return response()->json(['count' => 0]);
        }

        $count = UrgentNotification::where('psychologist_id', $user->id)
            ->where('is_acknowledged', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function acknowledge(Request $request, UrgentNotification $urgentNotification)
    {
        Gate::authorize('acknowledge', $urgentNotification);

        $urgentNotification->update([
            'is_acknowledged' => true,
            'acknowledged_at' => now(),
        ]);

        return new UrgentNotificationResource($urgentNotification);
    }
}