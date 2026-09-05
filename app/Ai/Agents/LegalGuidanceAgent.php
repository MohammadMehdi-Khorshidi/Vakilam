<?php

namespace App\Ai\Agents;

use App\Models\AiInteraction;
use App\Models\LegalMatter;
use App\Models\LegalRequest;
use App\Models\User;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class LegalGuidanceAgent implements Agent, Conversational
{
    use Promptable;

    public function __construct(
        private readonly User $user,
        private readonly ?LegalRequest $legalRequest = null,
        private readonly ?LegalMatter $legalMatter = null,
    ) {
    }

    public function instructions(): Stringable|string
    {
        $context = $this->legalMatter?->title
            ?: $this->legalRequest?->title
            ?: 'موضوع حقوقی عمومی کاربر';

        return <<<PROMPT
شما دستیار راهنمای حقوقی سامانه وکیلم هستید. پاسخ را به فارسی، روشن، کوتاه و مرحله‌بندی‌شده بنویسید.
موضوع جاری: {$context}
اطلاعاتی را که کاربر ارائه نکرده است قطعی فرض نکنید. نتیجه پرونده را تضمین نکنید و پاسخ را جایگزین مشاوره وکیل معرفی نکنید.
اگر اطلاعات برای پاسخ ایمن کافی نیست، پرسش تکمیلی مشخص بپرسید. در موضوعات فوری یا دارای مهلت قانونی، کاربر را به بررسی سریع توسط وکیل راهنمایی کنید.
PROMPT;
    }

    public function messages(): iterable
    {
        $query = AiInteraction::query()
            ->where('user_id', $this->user->id)
            ->where('purpose', 'legal_guidance_chat')
            ->where('status', 'completed');

        if ($this->legalRequest !== null) {
            $query->where('legal_request_id', $this->legalRequest->id);
        } elseif ($this->legalMatter !== null) {
            $query->where('legal_matter_id', $this->legalMatter->id);
        } else {
            $query->whereNull('legal_request_id')->whereNull('legal_matter_id');
        }

        return $query
            ->latest('created_at')
            ->limit(20)
            ->get()
            ->reverse()
            ->flatMap(fn (AiInteraction $interaction): array => [
                new Message('user', (string) $interaction->input_summary),
                new Message('assistant', (string) $interaction->output_text),
            ])
            ->values()
            ->all();
    }
}
