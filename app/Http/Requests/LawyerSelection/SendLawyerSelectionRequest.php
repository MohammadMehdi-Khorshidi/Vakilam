<?php

namespace App\Http\Requests\LawyerSelection;

use App\Models\LawyerProfile;
use App\Models\LegalRequest;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class SendLawyerSelectionRequest extends FormRequest
{
    /**
     * Determine whether the authenticated client owns
     * the legal request and is allowed to send a lawyer-selection request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $legalRequest = $this->route('legalRequest');
        $lawyerProfile = $this->route('lawyerProfile');

        return $user instanceof User
            && $user->status === 'active'
            && $legalRequest instanceof LegalRequest
            && $lawyerProfile instanceof LawyerProfile
            && $legalRequest->client_user_id === $user->id;
    }

    /**
     * Sending a direct lawyer-selection request
     * does not require request body fields.
     */
    public function rules(): array
    {
        return [];
    }
}