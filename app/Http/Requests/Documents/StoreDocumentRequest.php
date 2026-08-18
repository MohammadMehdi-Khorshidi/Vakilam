<?php

namespace App\Http\Requests\Documents;

use App\Models\LegalRequest;
use App\Models\User;
use App\Services\Documents\DocumentAccessService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(DocumentAccessService $access): bool
    {
        return $this->route('legalRequest') instanceof LegalRequest
            && $this->user() instanceof User
            && $access->canManageLegalRequest($this->user(), $this->route('legalRequest'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'document_type_id' => ['nullable', 'uuid', Rule::exists('document_types', 'id')->where('status', true)],
            'file' => ['required', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:5120'],
        ];
    }
}
