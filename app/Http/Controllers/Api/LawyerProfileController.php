<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lawyers\UpdateLawyerProfileRequest;
use App\Http\Resources\LawyerProfileResource;
use App\Models\LawyerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class LawyerProfileController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    public function show(Request $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        $this->loadProfileRelations($profile);

        return response()->json([
            'lawyer_profile' => LawyerProfileResource::make($profile)->resolve(),
        ]);
    }

    public function update(UpdateLawyerProfileRequest $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        $data = $request->validated();

        DB::transaction(function () use ($profile, $data): void {
            $profile = LawyerProfile::query()->lockForUpdate()->findOrFail($profile->id);

            if (array_key_exists('first_name', $data) || array_key_exists('last_name', $data)) {
                $user = $profile->user()->lockForUpdate()->firstOrFail();
                $user->fill([
                    'name' => $data['first_name'] ?? $user->name,
                    'last_name' => $data['last_name'] ?? $user->last_name,
                ])->save();

                $profile->full_name = trim($user->name.' '.$user->last_name);
            }

            $profile->fill(collect($data)->only([
                'bio',
                'is_available',
            ])->all());
            $profile->save();

            if (array_key_exists('specialties', $data)) {
                $profile->lawyerSpecialties()->delete();

                foreach ($data['specialties'] as $specialty) {
                    $profile->lawyerSpecialties()->create(Arr::only(
                        $specialty,
                        ['specialty_id', 'years_experience'],
                    ));
                }
            }

            if (array_key_exists('service_areas', $data)) {
                $profile->serviceAreas()->delete();

                foreach ($data['service_areas'] as $area) {
                    $profile->serviceAreas()->create(Arr::only(
                        $area,
                        ['province_id', 'city_id'],
                    ));
                }
            }
        });

        $profile->refresh();
        $this->loadProfileRelations($profile);

        return response()->json([
            'message' => 'Lawyer profile updated successfully.',
            'lawyer_profile' => LawyerProfileResource::make($profile)->resolve(),
        ]);
    }

    private function loadProfileRelations(LawyerProfile $profile): void
    {
        $profile->load([
            'user:id,name,last_name,phone',
            'lawyerSpecialties.specialty:id,code,name,status',
            'serviceAreas.province:id,name',
            'serviceAreas.city:id,province_id,name',
        ]);
    }
}
