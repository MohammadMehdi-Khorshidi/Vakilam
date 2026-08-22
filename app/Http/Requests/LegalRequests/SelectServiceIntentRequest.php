<?php

namespace App\Http\Requests\LegalRequests;

use App\Enums\LegalRequestServiceIntent;
use App\Models\LegalRequest;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SelectServiceIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $legalRequest = $this->route('legalRequest');

        return $user instanceof User
            && $user->status === 'active'
            && $legalRequest instanceof LegalRequest
            && $legalRequest->client_user_id === $user->id;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'service_intent' => [
                'required',
                Rule::in(LegalRequestServiceIntent::selectableValues()),
            ],
        ];
    }
}
