<?php

namespace App\Services\Documents;

use App\Models\Document;
use App\Models\LegalMatter;
use App\Models\LegalRequest;
use App\Models\User;

class DocumentAccessService
{
    public function canManageLegalRequest(User $user, LegalRequest $legalRequest): bool
    {
        return $legalRequest->client_user_id === $user->id;
    }

    public function canViewLegalMatter(User $user, LegalMatter $legalMatter): bool
    {
        return $this->canManageLegalMatter($user, $legalMatter)
            || $this->isAssignedLawyer($user, $legalMatter);
    }

    public function canManageLegalMatter(User $user, LegalMatter $legalMatter): bool
    {
        return $legalMatter->client_user_id === $user->id;
    }

    public function canViewDocument(User $user, Document $document): bool
    {
        if ($document->legal_request_id !== null && $document->legal_matter_id === null) {
            $legalRequest = $document->legalRequest()->first();

            if ($legalRequest === null) {
                return false;
            }

            if ($this->canManageLegalRequest($user, $legalRequest)) {
                return true;
            }

            return LegalMatter::query()
                ->where('source_legal_request_id', $legalRequest->id)
                ->where('client_user_id', $legalRequest->client_user_id)
                ->whereHas('engagement', fn ($query) => $query
                    ->where('client_user_id', $legalRequest->client_user_id)
                    ->whereHas('lawyerProfile', fn ($profileQuery) => $profileQuery
                        ->where('user_id', $user->id)))
                ->exists();
        }

        if ($document->legal_matter_id !== null && $document->legal_request_id === null) {
            $legalMatter = $document->legalMatter()->first();

            return $legalMatter !== null && $this->canViewLegalMatter($user, $legalMatter);
        }

        return false;
    }

    public function canManageDocument(User $user, Document $document): bool
    {
        if ($document->legal_request_id !== null && $document->legal_matter_id === null) {
            $legalRequest = $document->legalRequest()->first();

            return $legalRequest !== null && $this->canManageLegalRequest($user, $legalRequest);
        }

        if ($document->legal_matter_id !== null && $document->legal_request_id === null) {
            $legalMatter = $document->legalMatter()->first();

            return $legalMatter !== null && $this->canManageLegalMatter($user, $legalMatter);
        }

        return false;
    }

    private function isAssignedLawyer(User $user, LegalMatter $legalMatter): bool
    {
        return $legalMatter->engagement()
            ->where('client_user_id', $legalMatter->client_user_id)
            ->whereHas('lawyerProfile', fn ($query) => $query->where('user_id', $user->id))
            ->exists();
    }
}
