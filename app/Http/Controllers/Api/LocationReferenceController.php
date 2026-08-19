<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Province;
use Illuminate\Http\JsonResponse;

class LocationReferenceController extends Controller
{
    public function provinces(): JsonResponse
    {
        return response()->json([
            'data' => Province::query()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function cities(Province $province): JsonResponse
    {
        return response()->json([
            'data' => $province->cities()
                ->orderBy('name')
                ->get(['id', 'province_id', 'name']),
        ]);
    }
}
