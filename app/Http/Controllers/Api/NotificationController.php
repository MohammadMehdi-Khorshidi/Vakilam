<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->integer('limit', 20), 1), 50);

        $items = $request->user()
            ->userNotifications()
            ->latest('created_at')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $items,
            'meta' => [
                'unread_count' => $request->user()
                    ->userNotifications()
                    ->where('status', 'unread')
                    ->count(),
            ],
        ]);
    }

    public function read(Request $request, UserNotification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        if ($notification->status === 'unread') {
            $notification->forceFill([
                'status' => 'read',
                'read_at' => now(),
            ])->save();
        }

        return response()->json(['data' => $notification->fresh()]);
    }

    public function readAll(Request $request): JsonResponse
    {
        $request->user()
            ->userNotifications()
            ->where('status', 'unread')
            ->update([
                'status' => 'read',
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'همه اعلان‌ها خوانده شدند.',
        ]);
    }
}
