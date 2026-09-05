<?php

namespace App\Services\Conversations;

use App\Models\Consultation;
use App\Models\Conversation;
use App\Models\LegalMatter;
use App\Models\User;

class ConversationProvisioner
{
    public function forConsultation(Consultation $consultation): ?Conversation
    {
        $consultation->loadMissing('lawyerProfile:id,user_id');

        $lawyerUserId = $consultation->lawyerProfile?->user_id;

        if ($lawyerUserId === null || $consultation->client_user_id === null) {
            return null;
        }

        $conversation = Conversation::query()->firstOrCreate(
            ['consultation_id' => $consultation->id],
            [
                'legal_matter_id' => null,
                'status' => 'active',
            ],
        );

        $this->restoreParticipant($conversation, $consultation->client_user_id);
        $this->restoreParticipant($conversation, $lawyerUserId);

        return $conversation;
    }

    public function closeForConsultation(Consultation $consultation): void
    {
        $conversation = Conversation::query()
            ->where('consultation_id', $consultation->id)
            ->where('status', 'active')
            ->first();

        if ($conversation === null) {
            return;
        }

        $conversation->forceFill([
            'status' => 'closed',
            'closed_at' => now(),
        ])->save();

        $conversation->participantRecords()
            ->whereNull('left_at')
            ->update(['left_at' => now()]);
    }

    public function forLegalMatter(LegalMatter $legalMatter): ?Conversation
    {
        $legalMatter->loadMissing('engagement.lawyerProfile:id,user_id');

        $lawyerUserId = $legalMatter->engagement?->lawyerProfile?->user_id;

        if ($lawyerUserId === null || $legalMatter->client_user_id === null) {
            return null;
        }

        $conversation = Conversation::query()->firstOrCreate(
            ['legal_matter_id' => $legalMatter->id],
            [
                'consultation_id' => null,
                'status' => 'active',
            ],
        );

        $this->restoreParticipant($conversation, $legalMatter->client_user_id);
        $this->restoreParticipant($conversation, $lawyerUserId);

        return $conversation;
    }

    private function restoreParticipant(Conversation $conversation, string $userId): void
    {
        abort_unless(User::query()->whereKey($userId)->where('status', 'active')->exists(), 409);

        $participant = $conversation->participantRecords()->firstOrNew([
            'user_id' => $userId,
        ]);

        if (! $participant->exists) {
            $participant->joined_at = now();
        }

        $participant->left_at = null;
        $participant->save();
    }
}
