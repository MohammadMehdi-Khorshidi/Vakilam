<?php

namespace App\Http\Requests\Documents;

use App\Models\Document;
use App\Models\User;
use App\Services\Documents\DocumentAccessService;
use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentVersionRequest extends FormRequest
{
    public function authorize(DocumentAccessService $access): bool
    {
        return $this->route('document') instanceof Document
            && $this->user() instanceof User
            && $access->canManageDocument($this->user(), $this->route('document'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:5120'],
        ];
    }
}
