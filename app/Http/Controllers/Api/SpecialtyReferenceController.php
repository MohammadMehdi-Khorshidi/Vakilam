<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Specialty;
use Illuminate\Http\JsonResponse;

class SpecialtyReferenceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Specialty::query()
                ->where('status', true)
                ->orderBy('name')
                ->get(['id', 'code', 'name']),
        ]);
    }
}
