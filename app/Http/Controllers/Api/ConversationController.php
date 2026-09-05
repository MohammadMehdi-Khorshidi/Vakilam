<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Conversations\StoreConversationMessageRequest;
use App\Http\Resources\ConversationMessageResource;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        $conversations = Conversation::query()
            ->whereHas('participantRecords', fn ($query) => $query
                ->where('user_id', $user->id)
                ->whereNull('left_at'))
            ->with([
                'legalMatter:id,public_id,title',
                'consultation:id,public_id,legal_request_id',
                'consultation.legalRequest:id,title',
                'participants.roles:id,code',
                'participants.clientProfile:id,user_id,full_name',
                'participants.lawyerProfile:id,user_id,public_id,full_name',
                'lastMessage.sender:id,public_id,name,last_name',
            ])
            ->orderByDesc(
                Message::query()
                    ->select('sent_at')
                    ->whereColumn('messages.conversation_id', 'conversations.id')
                    ->where('status', '!=', 'deleted')
                    ->latest('sent_at')
                    ->limit(1),
            )
            ->orderByDesc('created_at')
            ->paginate(30);

        return ConversationResource::collection($conversations);
    }

    public function show(Request $request, Conversation $conversation): ConversationResource
    {
        $this->authorizeParticipant($request, $conversation);

        $messages = $conversation->messages()
            ->with('sender:id,public_id,name,last_name')
            ->latest('sent_at')
            ->limit(100)
            ->get()
            ->reverse()
            ->values();

        $conversation->load([
            'legalMatter:id,public_id,title',
            'consultation:id,public_id,legal_request_id',
            'consultation.legalRequest:id,title',
            'participants.roles:id,code',
            'participants.clientProfile:id,user_id,full_name',
            'participants.lawyerProfile:id,user_id,public_id,full_name',
            'lastMessage.sender:id,public_id,name,last_name',
        ])->setRelation('messages', $messages);

        return ConversationResource::make($conversation);
    }

    public function storeMessage(
        StoreConversationMessageRequest $request,
        Conversation $conversation,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $body = trim($request->validated('body'));

        abort_if($body === '', 422, 'متن پیام الزامی است.');

        $message = DB::transaction(function () use ($conversation, $user, $body): Message {
            $lockedConversation = Conversation::query()
                ->whereKey($conversation->id)
                ->lockForUpdate()
                ->firstOrFail();

            $isParticipant = $lockedConversation->participantRecords()
                ->where('user_id', $user->id)
                ->whereNull('left_at')
                ->exists();

            abort_unless($isParticipant, 403, 'شما به این گفتگو دسترسی ندارید.');
            abort_unless($lockedConversation->status === 'active', 409, 'این گفتگو بسته شده است.');

            return $lockedConversation->messages()->create([
                'sender_user_id' => $user->id,
                'body' => $body,
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        });

        return response()->json([
            'data' => ConversationMessageResource::make(
                $message->load('sender:id,public_id,name,last_name'),
            )->resolve($request),
        ], 201);
    }

    private function authorizeParticipant(Request $request, Conversation $conversation): void
    {
        abort_unless(
            $conversation->participantRecords()
                ->where('user_id', $request->user()?->id)
                ->whereNull('left_at')
                ->exists(),
            403,
            'شما به این گفتگو دسترسی ندارید.',
        );
    }
}
