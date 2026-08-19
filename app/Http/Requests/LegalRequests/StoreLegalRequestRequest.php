<?php

namespace App\Http\Requests\LegalRequests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreLegalRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User
            && $user->status === 'active'
            && $user->roles()
                ->where('roles.code', 'client')
                ->wherePivotNull('revoked_at')
                ->exists();
    }

    protected function prepareForValidation(): void
    {
        $values = [];

        if ($this->has('description') && is_string($this->input('description'))) {
            $values['description'] = trim($this->input('description'));
        }

        if ($this->has('title') && is_string($this->input('title'))) {
            $values['title'] = trim($this->input('title'));
        }

        $this->merge($values);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:200'],
            'description' => ['required', 'string'],
            'legal_category_id' => [
                'nullable',
                'uuid',
                Rule::exists('legal_categories', 'id')->where('status', true),
            ],
            'province_id' => ['nullable', 'integer', Rule::exists('provinces', 'id')],
            'city_id' => [
                'nullable',
                'integer',
                Rule::exists('cities', 'id')->where(function ($query): void {
                    if ($this->filled('province_id')) {
                        $query->where('province_id', $this->integer('province_id'));
                    }
                }),
            ],
            'urgency' => ['nullable', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'service_intent' => [
                'nullable',
                Rule::in(['undecided', 'consultation', 'lawyer_selection']),
            ],
            'parties' => ['sometimes', 'array'],
            'parties.*.party_role' => [
                'required',
                Rule::in(['plaintiff', 'defendant', 'witness', 'other']),
            ],
            'parties.*.full_name' => ['nullable', 'string', 'max:120'],
            'parties.*.relation_note' => ['nullable', 'string', 'max:255'],
            'parties.*.is_client' => ['sometimes', 'boolean'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $clientPartyCount = collect($this->input('parties', []))
                    ->filter(fn (mixed $party): bool => is_array($party)
                        && filter_var($party['is_client'] ?? false, FILTER_VALIDATE_BOOL))
                    ->count();

                if ($clientPartyCount > 1) {
                    $validator->errors()->add(
                        'parties',
                        'Only one party may be marked as the client.',
                    );
                }
            },
        ];
    }
}
