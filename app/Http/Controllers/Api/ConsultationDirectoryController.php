<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LawyerPublicResource;
use App\Models\LegalRequest;
use App\Models\User;
use App\Services\Consultations\ConsultationDirectoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultationDirectoryController extends Controller
{
    public function index(
        Request $request,
        LegalRequest $legalRequest,
        ConsultationDirectoryService $service,
    ): JsonResponse {
        $user = $request->user();
        abort_unless(
            $user instanceof User && $user->status === 'active' && $legalRequest->client_user_id === $user->id,
            403,
            'شما اجازه مشاهده وکلای این درخواست را ندارید.',
        );

        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'sort' => ['nullable', 'string', 'in:match,rating,experience,soonest'],
            'has_availability' => ['nullable', 'boolean'],
            'min_rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ], [
            'sort.in' => 'نوع مرتب‌سازی معتبر نیست.',
            'min_rating.min' => 'حداقل امتیاز نمی‌تواند کمتر از صفر باشد.',
            'min_rating.max' => 'حداقل امتیاز نمی‌تواند بیشتر از پنج باشد.',
        ]);

        $items = $service->ranked($legalRequest, $filters);
        $page = max((int) ($filters['page'] ?? 1), 1);
        $perPage = min(max((int) ($filters['per_page'] ?? 18), 1), 50);
        $total = $items->count();
        $slice = $items->forPage($page, $perPage)->values();

        return response()->json([
            'data' => $slice->map(fn (array $item): array => [
                'lawyer' => LawyerPublicResource::make($item['lawyer'])->resolve(),
                'years_experience' => $item['years_experience'],
                'sort_metrics' => [
                    'topic_match' => (bool) $item['topic_match'],
                    'location' => (int) $item['location_level'],
                    'experience' => (int) $item['years_experience'],
                    'rating' => (float) ($item['lawyer']->average_rating ?? 0),
                ],
                'nearest_available_at' => $item['nearest_available_at'],
                'has_availability' => $item['has_availability'],
                'rates' => $item['rates'],
                'min_price_rial' => $item['min_price_rial'],
            ])->all(),
            'meta' => [
                'current_page' => $page,
                'last_page' => max((int) ceil($total / $perPage), 1),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
    }
}
