<?php

namespace App\Http\Requests\LegalRequests;

use App\Enums\LegalRequestServiceIntent;
use App\Models\LegalCategory;
use App\Models\LegalRequest;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateLegalRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $legalRequest = $this->route('legalRequest');

        return $user instanceof User
            && $user->status === 'active'
            && $legalRequest instanceof LegalRequest
            && $legalRequest->client_user_id === $user->id
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

        if ($this->has('legal_category_id') && is_string($this->input('legal_category_id'))) {
            $categoryValue = trim($this->input('legal_category_id'));

            if ($categoryValue !== '' && ! Str::isUuid($categoryValue)) {
                $categoryId = LegalCategory::query()
                    ->where('code', $categoryValue)
                    ->where('status', true)
                    ->value('id');

                if (is_string($categoryId) && $categoryId !== '') {
                    $values['legal_category_id'] = $categoryId;
                }
            }
        }

        $this->merge($values);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        /** @var LegalRequest|null $legalRequest */
        $legalRequest = $this->route('legalRequest');
        $provinceId = $this->has('province_id')
            ? $this->input('province_id')
            : $legalRequest?->province_id;

        return [
            'title' => ['sometimes', 'nullable', 'string', 'max:200'],
            'description' => ['sometimes', 'required', 'string'],
            'legal_category_id' => [
                'sometimes',
                'nullable',
                'uuid',
                Rule::exists('legal_categories', 'id')->where('status', true),
            ],
            'province_id' => ['sometimes', 'nullable', 'integer', Rule::exists('provinces', 'id')],
            'city_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('cities', 'id')->where(
                    fn ($query) => $query->where('province_id', $provinceId),
                ),
            ],
            'urgency' => [
                'sometimes',
                'nullable',
                Rule::in(['low', 'normal', 'high', 'urgent']),
            ],
            'service_intent' => [
                'sometimes',
                Rule::in(LegalRequestServiceIntent::draftValues()),
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
