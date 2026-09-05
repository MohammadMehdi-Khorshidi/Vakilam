<?php

namespace App\Http\Controllers\Api;

use App\Ai\Agents\LegalGuidanceAgent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Ai\StoreLegalGuidanceMessageRequest;
use App\Models\AiInteraction;
use App\Models\LegalMatter;
use App\Models\LegalRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class LegalGuidanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $interactions = AiInteraction::query()
            ->where('user_id', $user->id)
            ->where('purpose', 'legal_guidance_chat')
            ->whereIn('status', ['completed', 'failed'])
            ->latest('created_at')
            ->limit(50)
            ->get()
            ->reverse()
            ->values();

        $messages = $interactions->flatMap(function (AiInteraction $interaction): array {
            $items = [[
                'id' => $interaction->public_id.':user',
                'role' => 'user',
                'content' => $interaction->input_summary,
                'created_at' => $interaction->created_at?->toISOString(),
            ]];

            if ($interaction->output_text !== null) {
                $items[] = [
                    'id' => $interaction->public_id.':assistant',
                    'role' => 'assistant',
                    'content' => $interaction->output_text,
                    'created_at' => $interaction->completed_at?->toISOString(),
                ];
            }

            return $items;
        })->values();

        return response()->json(['data' => $messages]);
    }

    public function store(StoreLegalGuidanceMessageRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $data = $request->validated();
        $message = trim($data['message']);

        abort_if($message === '', 422, 'متن پرسش الزامی است.');

        [$legalRequest, $legalMatter] = $this->resolveContext($user, $data);

        $provider = (string) config('vakilam.ai.provider', config('ai.default'));
        $model = config('vakilam.ai.model');

        $interaction = AiInteraction::query()->create([
            'user_id' => $user->id,
            'legal_request_id' => $legalRequest?->id,
            'legal_matter_id' => $legalMatter?->id,
            'purpose' => 'legal_guidance_chat',
            'provider' => $provider,
            'model' => is_string($model) && $model !== '' ? $model : 'provider-default',
            'status' => 'running',
            'input_summary' => $message,
            'requires_review' => true,
            'started_at' => now(),
        ]);

        try {
            $response = (new LegalGuidanceAgent($user, $legalRequest, $legalMatter))
                ->prompt(
                    $message,
                    provider: $provider,
                    model: is_string($model) && $model !== '' ? $model : null,
                    timeout: (int) config('vakilam.ai.timeout', 45),
                );

            $answer = trim((string) $response);

            if ($answer === '') {
                throw new \RuntimeException('The AI provider returned an empty response.');
            }

            $interaction->forceFill([
                'status' => 'completed',
                'output_text' => $answer,
                'completed_at' => now(),
            ])->save();
        } catch (Throwable $exception) {
            $interaction->forceFill([
                'status' => 'failed',
                'completed_at' => now(),
            ])->save();

            report($exception);

            return response()->json([
                'message' => 'دستیار حقوقی موقتاً در دسترس نیست. پرسش شما ذخیره شد؛ لطفاً دوباره تلاش کنید.',
            ], 503);
        }

        return response()->json([
            'data' => [
                'user_message' => [
                    'id' => $interaction->public_id.':user',
                    'role' => 'user',
                    'content' => $interaction->input_summary,
                    'created_at' => $interaction->created_at?->toISOString(),
                ],
                'assistant_message' => [
                    'id' => $interaction->public_id.':assistant',
                    'role' => 'assistant',
                    'content' => $interaction->output_text,
                    'created_at' => $interaction->completed_at?->toISOString(),
                ],
            ],
        ], 201);
    }

    /** @param array<string, mixed> $data
     *  @return array{0: ?LegalRequest, 1: ?LegalMatter}
     */
    private function resolveContext(User $user, array $data): array
    {
        abort_if(
            ! empty($data['legal_request_public_id'])
                && ! empty($data['legal_matter_public_id']),
            422,
            'فقط یک زمینه برای گفتگو انتخاب کنید.',
        );

        $legalRequest = null;
        $legalMatter = null;

        if (! empty($data['legal_request_public_id'])) {
            $legalRequest = LegalRequest::query()
                ->where('public_id', $data['legal_request_public_id'])
                ->where('client_user_id', $user->id)
                ->firstOrFail();
        }

        if (! empty($data['legal_matter_public_id'])) {
            $legalMatter = LegalMatter::query()
                ->where('public_id', $data['legal_matter_public_id'])
                ->where(function ($query) use ($user): void {
                    $query->where('client_user_id', $user->id)
                        ->orWhereHas(
                            'engagement.lawyerProfile',
                            fn ($lawyerQuery) => $lawyerQuery->where('user_id', $user->id),
                        );
                })
                ->firstOrFail();
        }

        return [$legalRequest, $legalMatter];
    }
}
