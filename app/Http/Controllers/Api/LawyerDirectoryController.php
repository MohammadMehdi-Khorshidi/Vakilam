<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lawyers\ListLawyersRequest;
use App\Http\Resources\LawyerPublicResource;
use App\Models\City;
use App\Models\LawyerProfile;
use Illuminate\Http\JsonResponse;

class LawyerDirectoryController extends Controller
{
    public function index(ListLawyersRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $city = isset($filters['city_id'])
            ? City::query()->findOrFail($filters['city_id'])
            : null;

        $lawyers = LawyerProfile::query()
            ->where('verification_status', 'approved')
            ->where('is_available', true)
            ->whereHas('user', fn ($query) => $query->where('status', 'active'))
            ->when(
                $filters['specialty_id'] ?? null,
                fn ($query, $specialtyId) => $query->whereHas(
                    'specialties',
                    fn ($query) => $query
                        ->where('specialties.id', $specialtyId)
                        ->where('specialties.status', true),
                ),
            )
            ->when(
                $filters['province_id'] ?? null,
                fn ($query, $provinceId) => $query->whereHas(
                    'serviceAreas',
                    fn ($query) => $query->where('province_id', $provinceId),
                ),
            )
            ->when(
                $city,
                fn ($query, City $city) => $query->whereHas(
                    'serviceAreas',
                    fn ($query) => $query
                        ->where('province_id', $city->province_id)
                        ->where(fn ($query) => $query
                            ->whereNull('city_id')
                            ->orWhere('city_id', $city->id)),
                ),
            )
            ->with([
                'lawyerSpecialties.specialty:id,code,name,status',
                'serviceAreas.province:id,name',
                'serviceAreas.city:id,province_id,name',
            ])
            ->orderByDesc('average_rating')
            ->orderBy('full_name')
            ->paginate($filters['per_page'] ?? 15);

        return LawyerPublicResource::collection($lawyers)->response();
    }

    public function show(string $publicId): JsonResponse
    {
        $lawyer = LawyerProfile::query()
            ->where('public_id', $publicId)
            ->where('verification_status', 'approved')
            ->where('is_available', true)
            ->whereHas('user', fn ($query) => $query->where('status', 'active'))
            ->with([
                'lawyerSpecialties.specialty:id,code,name,status',
                'serviceAreas.province:id,name',
                'serviceAreas.city:id,province_id,name',
            ])
            ->firstOrFail();

        return response()->json([
            'lawyer' => LawyerPublicResource::make($lawyer)->resolve(),
        ]);
    }
}
