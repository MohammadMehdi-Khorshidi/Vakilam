<?php

namespace App\Http\Requests\LawyerSelection;

use App\Models\LegalRequest;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SelectFinalLawyerRequest extends FormRequest
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
            'proposal_public_id' => [
                'required',
                'uuid',
                Rule::exists('lawyer_proposals', 'public_id'),
            ],
        ];
    }
}
