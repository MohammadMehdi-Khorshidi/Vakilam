<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesAuthenticatedLawyer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lawyers\UpdateLawyerSpecialtiesRequest;
use App\Http\Resources\LawyerSpecialtyResource;
use App\Models\LawyerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class LawyerSpecialtyController extends Controller
{
    use ResolvesAuthenticatedLawyer;

    public function update(UpdateLawyerSpecialtiesRequest $request): JsonResponse
    {
        $profile = $this->authenticatedLawyerProfile($request);
        $specialties = $request->validated('specialties');

        DB::transaction(function () use ($profile, $specialties): void {
            $profile = LawyerProfile::query()->lockForUpdate()->findOrFail($profile->id);
            $profile->lawyerSpecialties()->delete();

            foreach ($specialties as $specialty) {
                $profile->lawyerSpecialties()->create(Arr::only($specialty, [
                    'specialty_id',
                    'years_experience',
                ]));
            }
        });

        $profile->load('lawyerSpecialties.specialty:id,code,name,status');

        return response()->json([
            'message' => 'Lawyer specialties updated successfully.',
            'specialties' => LawyerSpecialtyResource::collection(
                $profile->lawyerSpecialties,
            )->resolve(),
        ]);
    }
}
