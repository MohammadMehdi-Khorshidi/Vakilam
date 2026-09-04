<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LegalCategory;
use Illuminate\Http\JsonResponse;

class LegalCategoryReferenceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => LegalCategory::query()
                ->where('status', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'code', 'name']),
        ]);
    }
}
