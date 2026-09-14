<?php

namespace App\Http\Requests\Lawyers;

use App\Models\City;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateLawyerProfileRequest extends LawyerProfileRequest
{
    protected function prepareForValidation(): void
    {
        $values = [];

        foreach (['first_name', 'last_name', 'bio'] as $field) {
            if ($this->has($field) && is_string($this->input($field))) {
                $values[$field] = trim($this->input($field));
            }
        }

        $this->merge($values);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'license_number' => ['prohibited'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'is_available' => ['sometimes', 'boolean'],
            'specialties' => ['sometimes', 'array', 'max:20'],
            'specialties.*.specialty_id' => [
                'required',
                'uuid',
                'distinct:strict',
                Rule::exists('specialties', 'id')->where('status', true),
            ],
            'specialties.*.years_experience' => [
                'nullable',
                'integer',
                'min:0',
                'max:100',
            ],
            'service_areas' => ['sometimes', 'array', 'max:100'],
            'service_areas.*.province_id' => [
                'required',
                'integer',
                Rule::exists('provinces', 'id'),
            ],
            'service_areas.*.city_id' => [
                'nullable',
                'integer',
                Rule::exists('cities', 'id'),
            ],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'first_name.required' => 'نام را وارد کنید.',
            'first_name.max' => 'نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.',
            'last_name.required' => 'نام خانوادگی را وارد کنید.',
            'last_name.max' => 'نام خانوادگی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.',
            'bio.max' => 'متن معرفی نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد.',
            'specialties.array' => 'فهرست تخصص‌ها معتبر نیست.',
            'specialties.max' => 'حداکثر ۲۰ تخصص قابل انتخاب است.',
            'specialties.*.specialty_id.required' => 'تخصص را انتخاب کنید.',
            'specialties.*.specialty_id.exists' => 'تخصص انتخاب‌شده معتبر یا فعال نیست.',
            'specialties.*.specialty_id.distinct' => 'تخصص تکراری مجاز نیست.',
            'specialties.*.years_experience.integer' => 'سابقه تخصص باید عدد صحیح باشد.',
            'specialties.*.years_experience.min' => 'سابقه تخصص نمی‌تواند منفی باشد.',
            'specialties.*.years_experience.max' => 'سابقه تخصص نمی‌تواند بیشتر از ۱۰۰ سال باشد.',
            'service_areas.array' => 'فهرست محدوده‌های فعالیت معتبر نیست.',
            'service_areas.max' => 'حداکثر ۱۰۰ محدوده فعالیت قابل ثبت است.',
            'service_areas.*.province_id.required' => 'استان را انتخاب کنید.',
            'service_areas.*.province_id.exists' => 'استان انتخاب‌شده معتبر نیست.',
            'service_areas.*.city_id.exists' => 'شهر انتخاب‌شده معتبر نیست.',
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (! $this->has('service_areas')) {
                    return;
                }

                $areas = collect($this->input('service_areas', []))
                    ->filter(fn (mixed $area): bool => is_array($area));
                $seen = [];
                $provinceModes = [];

                foreach ($areas as $index => $area) {
                    $provinceId = $area['province_id'] ?? null;
                    $cityId = $area['city_id'] ?? null;

                    if ($provinceId === null) {
                        continue;
                    }

                    if ($cityId !== null && ! City::query()
                        ->whereKey($cityId)
                        ->where('province_id', $provinceId)
                        ->exists()) {
                        $validator->errors()->add(
                            "service_areas.{$index}.city_id",
                            'شهر انتخاب‌شده متعلق به استان انتخاب‌شده نیست.',
                        );
                    }

                    $key = $provinceId.':'.($cityId ?? 'all');

                    if (isset($seen[$key])) {
                        $validator->errors()->add(
                            "service_areas.{$index}",
                            'محدوده فعالیت تکراری مجاز نیست.',
                        );
                    }

                    $seen[$key] = true;
                    $mode = $cityId === null ? 'province' : 'city';

                    if (isset($provinceModes[$provinceId])
                        && $provinceModes[$provinceId] !== $mode) {
                        $validator->errors()->add(
                            "service_areas.{$index}",
                            'نمی‌توانید هم‌زمان کل استان و چند شهر از همان استان را انتخاب کنید.',
                        );
                    }

                    $provinceModes[$provinceId] = $mode;
                }
            },
        ];
    }
}
