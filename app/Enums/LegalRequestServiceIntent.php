<?php

namespace App\Enums;

enum LegalRequestServiceIntent: string
{
    case Undecided = 'undecided';
    case AiAssistant = 'ai_assistant';
    case Consultation = 'consultation';
    case LawyerSelection = 'lawyer_selection';

    /** @return array<int, string> */
    public static function draftValues(): array
    {
        return [
            self::Undecided->value,
            self::Consultation->value,
            self::LawyerSelection->value,
        ];
    }

    /** @return array<int, string> */
    public static function selectableValues(): array
    {
        return [
            self::Consultation->value,
            self::LawyerSelection->value,
        ];
    }
}
