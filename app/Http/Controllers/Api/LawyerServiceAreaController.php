<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lawyers\UpdateLawyerServiceAreasRequest;
use App\Http\Resources\LawyerServiceAreaResource;
use App\Models\LawyerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class LawyerServiceAreaController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    public function update(UpdateLawyerServiceAreasRequest $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        $areas = $request->validated('service_areas');

        DB::transaction(function () use ($profile, $areas): void {
            $profile = LawyerProfile::query()->lockForUpdate()->findOrFail($profile->id);
            $profile->serviceAreas()->delete();

            foreach ($areas as $area) {
                $profile->serviceAreas()->create(Arr::only($area, [
                    'province_id',
                    'city_id',
                ]));
            }
        });

        $profile->load([
            'serviceAreas.province:id,name',
            'serviceAreas.city:id,province_id,name',
        ]);

        return response()->json([
            'message' => 'Lawyer service areas updated successfully.',
            'service_areas' => LawyerServiceAreaResource::collection(
                $profile->serviceAreas,
            )->resolve(),
        ]);
    }
}
