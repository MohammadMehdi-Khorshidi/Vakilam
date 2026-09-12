<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Symfony\Component\HttpFoundation\Response;

class RealtimeAuthController extends Controller
{
    public function authorizeChannel(Request $request): JsonResponse
    {
        $response = Broadcast::auth($request);

        if ($response instanceof JsonResponse) {
            return $response;
        }

        if ($response instanceof Response) {
            $content = (string) $response->getContent();

            $content = preg_replace('/^\xEF\xBB\xBF/', '', $content) ?? $content;
            $content = trim($content);

            if ($content === '') {
                return response()->json([
                    'message' => 'Broadcast authorization returned an empty response.',
                ], 500);
            }

            $decoded = json_decode($content, true);

            if (! is_array($decoded)) {
                return response()->json([
                    'message' => 'Broadcast authorization returned invalid JSON.',
                ], 500);
            }

            return response()->json(
                $decoded,
                $response->getStatusCode(),
            );
        }

        if (is_array($response)) {
            return response()->json($response);
        }

        return response()->json([
            'message' => 'Broadcast authorization returned an unsupported response.',
        ], 500);
    }
}
