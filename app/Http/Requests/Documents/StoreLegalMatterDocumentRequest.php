<?php

namespace App\Http\Requests\Documents;

use App\Models\LegalMatter;
use App\Models\User;
use App\Services\Documents\DocumentAccessService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLegalMatterDocumentRequest extends FormRequest
{
    public function authorize(DocumentAccessService $access): bool
    {
        return $this->route('legalMatter') instanceof LegalMatter
            && $this->user() instanceof User
            && $access->canManageLegalMatter($this->user(), $this->route('legalMatter'));
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
