<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Province;
use Illuminate\Http\JsonResponse;

class ReferenceLocationController extends Controller
{
    public function provinces(): JsonResponse
    {
        $provinces = Province::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json(['provinces' => $provinces]);
    }

    public function cities(Province $province): JsonResponse
    {
        $cities = $province->cities()
            ->orderBy('name')
            ->get(['id', 'province_id', 'name']);

        return response()->json(['cities' => $cities]);
    }
}
